use std::fs;
use std::path::{Path, PathBuf};

use crate::case_id::CaseId;
use crate::workspace::Workspace;
use crate::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Priority {
    Required,
    Optional,
}

#[derive(Debug, Clone)]
pub struct TestCase {
    pub id: CaseId,
    pub location: String,
    pub priority: Priority,
}

struct CaseSection<'a> {
    id: CaseId,
    line: usize,
    body: Vec<&'a str>,
}

enum Line {
    CaseHeading(CaseId),
    OtherHeading,
    Body,
}

enum PriorityProblem {
    Missing,
    Invalid(String),
}

pub fn load(workspace: &Workspace, only: &[String]) -> Result<Vec<TestCase>, Error> {
    let mut cases = Vec::new();
    let mut errors = Vec::new();
    for path in document_paths(&workspace.docs_dir)? {
        let number = doc_number_of_file(&path);
        let selected = only.is_empty() || number.as_ref().is_some_and(|n| only.contains(n));
        if !selected {
            continue;
        }
        let file = workspace.display(&path);
        match fs::read_to_string(&path) {
            Ok(text) => {
                let (found, problems) = parse(&text, &file, number.as_deref());
                cases.extend(found);
                errors.extend(problems);
            }
            Err(error) => errors.push(format!("{file}: 読み込めません: {error}")),
        }
    }
    errors.extend(duplicates(&cases));
    if errors.is_empty() {
        Ok(cases)
    } else {
        Err(Error::Format(errors))
    }
}

fn document_paths(docs_dir: &Path) -> Result<Vec<PathBuf>, Error> {
    let entries = fs::read_dir(docs_dir).map_err(|_| {
        Error::Usage(format!(
            "テストケース文書のディレクトリがありません: {}",
            docs_dir.display()
        ))
    })?;
    let mut paths: Vec<PathBuf> = entries
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_ok_and(|t| t.is_file()))
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|ext| ext == "md"))
        .collect();
    paths.sort();
    Ok(paths)
}

fn doc_number_of_file(path: &Path) -> Option<String> {
    let name = path.file_name()?.to_str()?;
    let bytes = name.as_bytes();
    let numbered =
        bytes.len() >= 5 && bytes[..4].iter().all(u8::is_ascii_digit) && bytes[4] == b'_';
    numbered.then(|| name[..4].to_string())
}

fn parse(text: &str, file: &str, doc_number: Option<&str>) -> (Vec<TestCase>, Vec<String>) {
    let mut cases = Vec::new();
    let mut errors = Vec::new();
    if doc_number.is_none() {
        errors.push(format!(
            "{file}: ファイル名が <4桁の番号>_<タイトル>.md の形ではありません。"
        ));
    }
    for section in case_sections(text) {
        let location = format!("{file}:{}", section.line);
        let id = &section.id;
        if let Some(number) = doc_number.filter(|n| *n != id.doc_number()) {
            errors.push(format!(
                "{location}: {id} の番号が文書の番号 {number} と一致しません。"
            ));
        }
        match section.priority() {
            Ok(priority) => cases.push(TestCase {
                id: section.id,
                location,
                priority,
            }),
            Err(PriorityProblem::Missing) => errors.push(format!(
                "{location}: {id} に「- 優先度: 必須|任意」の行がありません。"
            )),
            Err(PriorityProblem::Invalid(value)) => errors.push(format!(
                "{location}: {id} の優先度「{value}」は 必須 か 任意 にしてください。"
            )),
        }
    }
    (cases, errors)
}

fn case_sections(text: &str) -> Vec<CaseSection<'_>> {
    let mut sections = Vec::new();
    let mut current: Option<CaseSection> = None;
    for (index, line) in text.lines().enumerate() {
        match classify(line) {
            Line::CaseHeading(id) => {
                sections.extend(current.take());
                current = Some(CaseSection {
                    id,
                    line: index + 1,
                    body: Vec::new(),
                });
            }
            Line::OtherHeading => sections.extend(current.take()),
            Line::Body => {
                if let Some(section) = current.as_mut() {
                    section.body.push(line);
                }
            }
        }
    }
    sections.extend(current);
    sections
}

fn classify(line: &str) -> Line {
    let level = line.bytes().take_while(|&b| b == b'#').count();
    let rest = &line[level..];
    let title = rest.trim_start();
    let is_heading = (1..=6).contains(&level) && title.len() < rest.len();
    if !is_heading {
        return Line::Body;
    }
    match CaseId::from_heading(title) {
        Some(id) if level >= 2 => Line::CaseHeading(id),
        _ => Line::OtherHeading,
    }
}

impl CaseSection<'_> {
    fn priority(&self) -> Result<Priority, PriorityProblem> {
        let value = self
            .body
            .iter()
            .find_map(|line| priority_value(line))
            .ok_or(PriorityProblem::Missing)?;
        match value {
            "必須" => Ok(Priority::Required),
            "任意" => Ok(Priority::Optional),
            other => Err(PriorityProblem::Invalid(other.to_string())),
        }
    }
}

fn priority_value(line: &str) -> Option<&str> {
    let item = line.trim_start();
    let item = item.strip_prefix('-').or_else(|| item.strip_prefix('*'))?;
    let value = item.trim_start().strip_prefix("優先度")?.trim_start();
    let value = value
        .strip_prefix(':')
        .or_else(|| value.strip_prefix('：'))?;
    value.split_whitespace().next()
}

fn duplicates(cases: &[TestCase]) -> Vec<String> {
    let mut errors = Vec::new();
    for (index, case) in cases.iter().enumerate() {
        if let Some(first) = cases[..index].iter().find(|c| c.id == case.id) {
            errors.push(format!(
                "{}: {} は {} と重複しています。",
                case.location, case.id, first.location
            ));
        }
    }
    errors
}

#[cfg(test)]
mod tests {
    use super::*;

    const DOC: &str = "# テストケース: 例

## 集計

### TC-0001-001 始業を切り上げて丸める

- 要求: PRD 0007 要求6
- 優先度: 必須
- 期待: 10:00 になる

### TC-0001-002 終業を切り捨てて丸める

- 優先度: 任意

## 廃止したケース

- TC-0001-003: 要求6に統合した
";

    fn summary(cases: &[TestCase]) -> Vec<(String, Priority, String)> {
        cases
            .iter()
            .map(|c| (c.id.to_string(), c.priority, c.location.clone()))
            .collect()
    }

    #[test]
    fn reads_case_headings_and_priorities_but_not_retired_list_items() {
        let (cases, errors) = parse(DOC, "docs/test/0001_example.md", Some("0001"));
        assert!(errors.is_empty(), "{errors:?}");
        assert_eq!(
            summary(&cases),
            [
                (
                    "TC-0001-001".to_string(),
                    Priority::Required,
                    "docs/test/0001_example.md:5".to_string()
                ),
                (
                    "TC-0001-002".to_string(),
                    Priority::Optional,
                    "docs/test/0001_example.md:11".to_string()
                ),
            ]
        );
    }

    #[test]
    fn reports_missing_invalid_priority_and_mismatched_doc_number() {
        let text = "### TC-0001-001 a\n\n### TC-0001-002 b\n- 優先度: 高\n\n### TC-0002-001 c\n- 優先度：必須\n";
        let (_, errors) = parse(text, "x.md", Some("0001"));
        assert_eq!(errors.len(), 3, "{errors:?}");
        assert!(errors[0].contains("TC-0001-001 に「- 優先度"));
        assert!(errors[1].contains("優先度「高」"));
        assert!(errors[2].contains("TC-0002-001 の番号が文書の番号 0001"));
    }

    #[test]
    fn ignores_priority_lines_after_the_next_heading() {
        let text = "### TC-0001-001 a\n\n#### 補足\n- 優先度: 必須\n";
        let (_, errors) = parse(text, "x.md", Some("0001"));
        assert_eq!(errors.len(), 1, "{errors:?}");
    }

    #[test]
    fn requires_a_numbered_file_name() {
        assert_eq!(
            doc_number_of_file(Path::new("docs/test/0001_x.md")).as_deref(),
            Some("0001")
        );
        assert!(doc_number_of_file(Path::new("docs/test/example.md")).is_none());
        assert!(doc_number_of_file(Path::new("docs/test/000あ_x.md")).is_none());
        let (_, errors) = parse("", "example.md", None);
        assert_eq!(errors.len(), 1);
    }

    #[test]
    fn reports_duplicate_ids_with_both_locations() {
        let (mut cases, _) = parse(
            "### TC-0001-001 a\n- 優先度: 必須\n",
            "0001_a.md",
            Some("0001"),
        );
        let (more, _) = parse(
            "### TC-0001-001 b\n- 優先度: 必須\n",
            "0001_b.md",
            Some("0001"),
        );
        cases.extend(more);
        assert_eq!(
            duplicates(&cases),
            ["0001_b.md:1: TC-0001-001 は 0001_a.md:1 と重複しています。"]
        );
    }
}

use std::fs;
use std::path::{Path, PathBuf};

use crate::case_id::CaseId;
use crate::workspace::Workspace;
use crate::Error;

#[derive(Debug, Clone)]
pub struct TestCase {
    pub id: CaseId,
    pub location: String,
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
    for (index, line) in text.lines().enumerate() {
        let Some(id) = case_heading(line) else {
            continue;
        };
        let location = format!("{file}:{}", index + 1);
        if let Some(number) = doc_number.filter(|n| *n != id.doc_number()) {
            errors.push(format!(
                "{location}: {id} の番号が文書の番号 {number} と一致しません。"
            ));
        }
        cases.push(TestCase { id, location });
    }
    (cases, errors)
}

fn case_heading(line: &str) -> Option<CaseId> {
    let level = line.bytes().take_while(|&b| b == b'#').count();
    let rest = &line[level..];
    let title = rest.trim_start();
    let is_case_level = (2..=6).contains(&level) && title.len() < rest.len();
    is_case_level.then(|| CaseId::from_heading(title)).flatten()
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
- 期待: 10:00 になる

### TC-0001-002 終業を切り捨てて丸める

# TC-0001-004 見出しの1段目はケースにしない

## 廃止したケース

- TC-0001-003: 要求6に統合した
";

    fn ids_and_locations(cases: &[TestCase]) -> Vec<(String, String)> {
        cases
            .iter()
            .map(|c| (c.id.to_string(), c.location.clone()))
            .collect()
    }

    #[test]
    fn reads_case_headings_but_not_top_level_headings_or_list_items() {
        let (cases, errors) = parse(DOC, "docs/test/0001_example.md", Some("0001"));
        assert!(errors.is_empty(), "{errors:?}");
        assert_eq!(
            ids_and_locations(&cases),
            [
                (
                    "TC-0001-001".to_string(),
                    "docs/test/0001_example.md:5".to_string()
                ),
                (
                    "TC-0001-002".to_string(),
                    "docs/test/0001_example.md:10".to_string()
                ),
            ]
        );
    }

    #[test]
    fn reports_ids_whose_number_differs_from_the_document() {
        let (_, errors) = parse("### TC-0002-001 c\n", "x.md", Some("0001"));
        assert_eq!(
            errors,
            ["x.md:1: TC-0002-001 の番号が文書の番号 0001 と一致しません。"]
        );
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
        let (mut cases, _) = parse("### TC-0001-001 a\n", "0001_a.md", Some("0001"));
        let (more, _) = parse("### TC-0001-001 b\n", "0001_b.md", Some("0001"));
        cases.extend(more);
        assert_eq!(
            duplicates(&cases),
            ["0001_b.md:1: TC-0001-001 は 0001_a.md:1 と重複しています。"]
        );
    }
}

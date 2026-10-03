use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fs;
use std::path::{Path, PathBuf};

const SKIP_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    "dist",
    "build",
    ".next",
    ".direnv",
    "result",
    "coverage",
];
const MAX_FILE_BYTES: u64 = 2 * 1024 * 1024;
const BINARY_PROBE_BYTES: usize = 8000;

pub const USAGE: &str =
    "使い方: check-test-ids [--docs <dir>] [--src <dir>]... [--only <番号>]... [--strict]

  --docs <dir>    テストケース文書のディレクトリ（既定: docs/test）
  --src <dir>     テストコードを探すディレクトリ。複数指定可（既定: .）
  --only <番号>   照合する文書の番号（例: 0001）。複数指定可
  --strict        文書にない ID がコードにある場合もエラーにする

終了コード: 0 合格、1 照合の不一致、2 引数または文書の書式の誤り";

#[derive(Debug, PartialEq, Eq)]
pub struct Options {
    pub docs: String,
    pub src: Vec<String>,
    pub only: Vec<String>,
    pub strict: bool,
    pub help: bool,
}

#[derive(Debug, PartialEq, Eq)]
pub struct UsageError(pub String);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TestCase {
    pub id: String,
    pub doc_number: String,
    pub file: String,
    pub line: usize,
    pub priority: Option<String>,
}

#[derive(Debug, Default)]
pub struct ParsedDocument {
    pub cases: Vec<TestCase>,
    pub errors: Vec<String>,
}

#[derive(Debug, Default)]
pub struct Comparison {
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug)]
pub struct Outcome {
    pub code: u8,
    pub out: Vec<String>,
    pub err: Vec<String>,
}

fn is_four_digits(value: &str) -> bool {
    value.len() == 4 && value.bytes().all(|b| b.is_ascii_digit())
}

pub fn parse_arguments(args: &[String]) -> Result<Options, UsageError> {
    let mut options = Options {
        docs: "docs/test".to_string(),
        src: Vec::new(),
        only: Vec::new(),
        strict: false,
        help: false,
    };
    let mut iter = args.iter();
    while let Some(arg) = iter.next() {
        match arg.as_str() {
            "--strict" => options.strict = true,
            "--help" | "-h" => options.help = true,
            "--docs" | "--src" | "--only" => {
                let value = iter
                    .next()
                    .ok_or_else(|| UsageError(format!("{arg} に値がありません。")))?;
                match arg.as_str() {
                    "--docs" => options.docs = value.clone(),
                    "--src" => options.src.push(value.clone()),
                    _ => {
                        if !is_four_digits(value) {
                            return Err(UsageError(format!(
                                "--only は4桁の番号で指定してください: {value}"
                            )));
                        }
                        options.only.push(value.clone());
                    }
                }
            }
            _ => return Err(UsageError(format!("不明な引数です: {arg}"))),
        }
    }
    if options.src.is_empty() {
        options.src.push(".".to_string());
    }
    Ok(options)
}

fn doc_number_of(file_name: &str) -> Option<String> {
    let bytes = file_name.as_bytes();
    let valid = bytes.len() >= 5 && bytes[..4].iter().all(u8::is_ascii_digit) && bytes[4] == b'_';
    valid.then(|| file_name[..4].to_string())
}

fn parse_case_id(text: &str) -> Option<(String, String)> {
    let bytes = text.as_bytes();
    let digits = |range: std::ops::Range<usize>| bytes[range].iter().all(u8::is_ascii_digit);
    let valid = bytes.len() >= 11
        && bytes.starts_with(b"TC-")
        && digits(3..7)
        && bytes[7] == b'-'
        && digits(8..11)
        && !bytes.get(11).is_some_and(u8::is_ascii_digit);
    valid.then(|| (text[..11].to_string(), text[3..7].to_string()))
}

fn heading_text(line: &str, min_level: usize) -> Option<&str> {
    let level = line.bytes().take_while(|&b| b == b'#').count();
    if level < min_level || level > 6 {
        return None;
    }
    let rest = &line[level..];
    let trimmed = rest.trim_start();
    (trimmed.len() < rest.len()).then_some(trimmed)
}

fn priority_of(line: &str) -> Option<String> {
    let rest = line.trim_start();
    let rest = rest.strip_prefix('-').or_else(|| rest.strip_prefix('*'))?;
    let rest = rest.trim_start().strip_prefix("優先度")?.trim_start();
    let rest = rest
        .strip_prefix(':')
        .or_else(|| rest.strip_prefix('：'))?
        .trim_start();
    rest.split_whitespace().next().map(str::to_string)
}

pub fn parse_case_document(text: &str, file: &str) -> ParsedDocument {
    let mut parsed = ParsedDocument::default();
    let file_name = Path::new(file)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(file);
    let doc_number = doc_number_of(file_name);
    if doc_number.is_none() {
        parsed.errors.push(format!(
            "{file}: ファイル名が <4桁の番号>_<タイトル>.md の形ではありません。"
        ));
    }

    let mut current: Option<TestCase> = None;
    let finish = |current: &mut Option<TestCase>, parsed: &mut ParsedDocument| {
        let Some(case) = current.take() else { return };
        match case.priority.as_deref() {
            None => parsed.errors.push(format!(
                "{}:{}: {} に「- 優先度: 必須|任意」の行がありません。",
                case.file, case.line, case.id
            )),
            Some("必須" | "任意") => {}
            Some(other) => parsed.errors.push(format!(
                "{}:{}: {} の優先度「{other}」は 必須 か 任意 にしてください。",
                case.file, case.line, case.id
            )),
        }
        parsed.cases.push(case);
    };

    for (index, line) in text.lines().enumerate() {
        let line_number = index + 1;
        if let Some((id, number)) = heading_text(line, 2).and_then(parse_case_id) {
            finish(&mut current, &mut parsed);
            if let Some(doc_number) = &doc_number {
                if &number != doc_number {
                    parsed.errors.push(format!(
                        "{file}:{line_number}: {id} の番号が文書の番号 {doc_number} と一致しません。"
                    ));
                }
            }
            current = Some(TestCase {
                id,
                doc_number: number,
                file: file.to_string(),
                line: line_number,
                priority: None,
            });
            continue;
        }
        if heading_text(line, 1).is_some() {
            finish(&mut current, &mut parsed);
            continue;
        }
        if let Some(case) = current.as_mut() {
            if case.priority.is_none() {
                case.priority = priority_of(line);
            }
        }
    }
    finish(&mut current, &mut parsed);
    parsed
}

pub struct LoadedCases {
    pub cases: Vec<TestCase>,
    pub errors: Vec<String>,
}

pub fn load_cases(
    docs_dir: &Path,
    only: &[String],
    show: &dyn Fn(&Path) -> String,
) -> Result<LoadedCases, UsageError> {
    let entries = fs::read_dir(docs_dir).map_err(|_| {
        UsageError(format!(
            "テストケース文書のディレクトリがありません: {}",
            docs_dir.display()
        ))
    })?;
    let mut names: Vec<String> = entries
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_ok_and(|t| t.is_file()))
        .filter_map(|entry| entry.file_name().into_string().ok())
        .filter(|name| name.ends_with(".md"))
        .collect();
    names.sort();

    let mut cases: Vec<TestCase> = Vec::new();
    let mut index: HashMap<String, usize> = HashMap::new();
    let mut errors = Vec::new();
    for name in names {
        if !only.is_empty() && !doc_number_of(&name).is_some_and(|n| only.contains(&n)) {
            continue;
        }
        let path = docs_dir.join(&name);
        let file = show(&path);
        let text = match fs::read_to_string(&path) {
            Ok(text) => text,
            Err(error) => {
                errors.push(format!("{file}: 読み込めません: {error}"));
                continue;
            }
        };
        let parsed = parse_case_document(&text, &file);
        errors.extend(parsed.errors);
        for case in parsed.cases {
            if let Some(&existing) = index.get(&case.id) {
                let existing = &cases[existing];
                errors.push(format!(
                    "{}:{}: {} は {}:{} と重複しています。",
                    case.file, case.line, case.id, existing.file, existing.line
                ));
                continue;
            }
            index.insert(case.id.clone(), cases.len());
            cases.push(case);
        }
    }
    Ok(LoadedCases { cases, errors })
}

pub fn find_code_references(bytes: &[u8]) -> BTreeSet<String> {
    let mut ids = BTreeSet::new();
    let is_separator = |b: u8| b == b'-' || b == b'_';
    let digits = |s: &[u8]| s.iter().all(u8::is_ascii_digit);
    let mut i = 0;
    while i + 11 <= bytes.len() {
        let candidate = &bytes[i..i + 11];
        let starts = candidate[0].eq_ignore_ascii_case(&b't')
            && candidate[1].eq_ignore_ascii_case(&b'c')
            && is_separator(candidate[2])
            && digits(&candidate[3..7])
            && is_separator(candidate[7])
            && digits(&candidate[8..11]);
        let preceded = i > 0 && bytes[i - 1].is_ascii_alphanumeric();
        let followed = bytes.get(i + 11).is_some_and(u8::is_ascii_digit);
        if starts && !preceded && !followed {
            let number = String::from_utf8_lossy(&candidate[3..7]);
            let serial = String::from_utf8_lossy(&candidate[8..11]);
            ids.insert(format!("TC-{number}-{serial}"));
            i += 11;
            continue;
        }
        i += 1;
    }
    ids
}

fn walk_source_files(
    root: &Path,
    excluded: &Path,
    files: &mut Vec<PathBuf>,
) -> Result<(), UsageError> {
    let entries = fs::read_dir(root).map_err(|_| {
        UsageError(format!(
            "探索するディレクトリがありません: {}",
            root.display()
        ))
    })?;
    let mut entries: Vec<_> = entries.filter_map(Result::ok).collect();
    entries.sort_by_key(|entry| entry.file_name());
    for entry in entries {
        let path = entry.path();
        if path == excluded {
            continue;
        }
        let Ok(file_type) = entry.file_type() else {
            continue;
        };
        let name = entry.file_name();
        if file_type.is_dir() {
            if SKIP_DIRS.iter().any(|skip| name == *skip) {
                continue;
            }
            walk_source_files(&path, excluded, files)?;
            continue;
        }
        if !file_type.is_file() || path.extension().is_some_and(|ext| ext == "md") {
            continue;
        }
        if entry.metadata().is_ok_and(|m| m.len() > MAX_FILE_BYTES) {
            continue;
        }
        files.push(path);
    }
    Ok(())
}

pub fn collect_references(
    src_dirs: &[PathBuf],
    docs_dir: &Path,
) -> Result<BTreeMap<String, Vec<PathBuf>>, UsageError> {
    let mut references: BTreeMap<String, Vec<PathBuf>> = BTreeMap::new();
    for root in src_dirs {
        let mut files = Vec::new();
        walk_source_files(root, docs_dir, &mut files)?;
        for file in files {
            let Ok(bytes) = fs::read(&file) else { continue };
            let probe = &bytes[..bytes.len().min(BINARY_PROBE_BYTES)];
            if probe.contains(&0) {
                continue;
            }
            for id in find_code_references(&bytes) {
                references.entry(id).or_default().push(file.clone());
            }
        }
    }
    Ok(references)
}

pub fn compare(
    cases: &[TestCase],
    references: &BTreeMap<String, Vec<String>>,
    only: &[String],
    strict: bool,
) -> Comparison {
    let mut result = Comparison::default();
    for case in cases {
        if references.contains_key(&case.id) {
            continue;
        }
        let message = format!(
            "{}（{}:{}）に対応するテストがありません。",
            case.id, case.file, case.line
        );
        if case.priority.as_deref() == Some("必須") {
            result.errors.push(message);
        } else {
            result.warnings.push(message);
        }
    }
    for (id, files) in references {
        if cases.iter().any(|case| &case.id == id) {
            continue;
        }
        if !only.is_empty() && !only.iter().any(|n| n == &id[3..7]) {
            continue;
        }
        let message = format!("{id} は文書にないケースです（{}）。", files.join(", "));
        if strict {
            result.errors.push(message);
        } else {
            result.warnings.push(message);
        }
    }
    result
}

fn usage_failure(message: String) -> Outcome {
    Outcome {
        code: 2,
        out: Vec::new(),
        err: vec![message, USAGE.to_string()],
    }
}

fn absolute(cwd: &Path, path: &str) -> PathBuf {
    let joined = cwd.join(path);
    joined.canonicalize().unwrap_or(joined)
}

pub fn run(args: &[String], cwd: &Path) -> Outcome {
    let options = match parse_arguments(args) {
        Ok(options) => options,
        Err(UsageError(message)) => return usage_failure(message),
    };
    if options.help {
        return Outcome {
            code: 0,
            out: vec![USAGE.to_string()],
            err: Vec::new(),
        };
    }
    let base = cwd.canonicalize().unwrap_or_else(|_| cwd.to_path_buf());
    let docs_dir = absolute(&base, &options.docs);
    let src_dirs: Vec<PathBuf> = options.src.iter().map(|dir| absolute(&base, dir)).collect();
    let show = |path: &Path| -> String {
        match path.strip_prefix(&base) {
            Ok(relative) if relative.as_os_str().is_empty() => ".".to_string(),
            Ok(relative) => relative.display().to_string(),
            Err(_) => path.display().to_string(),
        }
    };

    let loaded = match load_cases(&docs_dir, &options.only, &show) {
        Ok(loaded) => loaded,
        Err(UsageError(message)) => return usage_failure(message),
    };
    if !loaded.errors.is_empty() {
        return Outcome {
            code: 2,
            out: Vec::new(),
            err: loaded.errors.iter().map(|e| format!("書式: {e}")).collect(),
        };
    }
    let references = match collect_references(&src_dirs, &docs_dir) {
        Ok(references) => references,
        Err(UsageError(message)) => return usage_failure(message),
    };
    let references: BTreeMap<String, Vec<String>> = references
        .into_iter()
        .map(|(id, files)| (id, files.iter().map(|f| show(f)).collect()))
        .collect();
    let result = compare(&loaded.cases, &references, &options.only, options.strict);

    let total = loaded.cases.len();
    let covered = loaded
        .cases
        .iter()
        .filter(|case| references.contains_key(&case.id))
        .count();
    let required: Vec<&TestCase> = loaded
        .cases
        .iter()
        .filter(|case| case.priority.as_deref() == Some("必須"))
        .collect();
    let required_covered = required
        .iter()
        .filter(|case| references.contains_key(&case.id))
        .count();

    let mut out = vec![format!(
        "ケース {covered}/{total} 件にテストがあります（必須 {required_covered}/{} 件）。",
        required.len()
    )];
    out.extend(result.warnings.iter().map(|w| format!("警告: {w}")));
    let err: Vec<String> = result
        .errors
        .iter()
        .map(|e| format!("エラー: {e}"))
        .collect();
    Outcome {
        code: if err.is_empty() { 0 } else { 1 },
        out,
        err,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

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

    struct Project(PathBuf);

    impl Project {
        fn new(files: &[(&str, &str)]) -> Self {
            static COUNTER: AtomicUsize = AtomicUsize::new(0);
            let root = std::env::temp_dir().join(format!(
                "check-test-ids-{}-{}",
                std::process::id(),
                COUNTER.fetch_add(1, Ordering::SeqCst)
            ));
            let _ = fs::remove_dir_all(&root);
            for (path, content) in files {
                let path = root.join(path);
                fs::create_dir_all(path.parent().unwrap()).unwrap();
                fs::write(path, content).unwrap();
            }
            Project(root)
        }

        fn run(&self, args: &[&str]) -> Outcome {
            let args: Vec<String> = args.iter().map(|a| a.to_string()).collect();
            run(&args, &self.0)
        }
    }

    impl Drop for Project {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn ids_in(messages: &[String]) -> Vec<String> {
        messages
            .iter()
            .filter_map(|m| m.find("TC-").map(|i| m[i..i + 11].to_string()))
            .collect()
    }

    #[test]
    fn reads_case_headings_and_priorities_but_not_retired_list_items() {
        let parsed = parse_case_document(DOC, "docs/test/0001_example.md");
        assert!(parsed.errors.is_empty(), "{:?}", parsed.errors);
        let summary: Vec<_> = parsed
            .cases
            .iter()
            .map(|c| (c.id.as_str(), c.priority.as_deref(), c.line))
            .collect();
        assert_eq!(
            summary,
            vec![
                ("TC-0001-001", Some("必須"), 5),
                ("TC-0001-002", Some("任意"), 11),
            ]
        );
    }

    #[test]
    fn reports_missing_invalid_priority_and_mismatched_doc_number() {
        let text = "### TC-0001-001 a\n\n### TC-0001-002 b\n- 優先度: 高\n\n### TC-0002-001 c\n- 優先度：必須\n";
        let parsed = parse_case_document(text, "docs/test/0001_x.md");
        assert_eq!(parsed.errors.len(), 3, "{:?}", parsed.errors);
        assert!(parsed.errors[0].contains("TC-0001-001 に「- 優先度"));
        assert!(parsed.errors[1].contains("優先度「高」"));
        assert!(parsed.errors[2].contains("TC-0002-001 の番号が文書の番号 0001"));
    }

    #[test]
    fn ignores_priority_lines_after_the_next_heading() {
        let text = "### TC-0001-001 a\n\n#### 補足\n- 優先度: 必須\n";
        let parsed = parse_case_document(text, "docs/test/0001_x.md");
        assert_eq!(parsed.errors.len(), 1, "{:?}", parsed.errors);
    }

    #[test]
    fn rejects_files_not_named_with_a_number() {
        let parsed = parse_case_document("", "docs/test/example.md");
        assert_eq!(parsed.errors.len(), 1);
        let parsed = parse_case_document("", "docs/test/000あ_x.md");
        assert_eq!(parsed.errors.len(), 1);
    }

    #[test]
    fn does_not_treat_non_ascii_headings_as_cases() {
        let text = "### TC-あい-001 a\n### TC-00０1-001 b\n";
        let parsed = parse_case_document(text, "docs/test/0001_x.md");
        assert!(parsed.cases.is_empty());
        assert!(parsed.errors.is_empty(), "{:?}", parsed.errors);
    }

    #[test]
    fn normalizes_ids_written_in_each_language_style() {
        let code = [
            "fn tc_0001_014_rounds_start_up() {}",
            "test(\"TC-0001-015 終業\", () => {});",
            "it(\"tc-0001-016\", function() end)",
            "fn test_tc_0001_017() {}",
            "let atc_0001_018 = 1;",
            "tc_0001_0190",
        ]
        .join("\n");
        let ids: Vec<String> = find_code_references(code.as_bytes()).into_iter().collect();
        assert_eq!(
            ids,
            vec!["TC-0001-014", "TC-0001-015", "TC-0001-016", "TC-0001-017"]
        );
    }

    #[test]
    fn fails_on_required_case_without_test_and_only_warns_on_optional() {
        let project = Project::new(&[
            ("docs/test/0001_example.md", DOC),
            ("src/lib.rs", "fn x() {}"),
        ]);
        let outcome = project.run(&[]);
        assert_eq!(outcome.code, 1);
        assert_eq!(outcome.err.len(), 1);
        assert!(outcome.err[0].contains("TC-0001-001（docs/test/0001_example.md:5）"));
        assert!(outcome.out[0].contains("ケース 0/2 件"));
        assert!(outcome.out[0].contains("必須 0/1 件"));
        assert!(outcome
            .out
            .iter()
            .any(|l| l.starts_with("警告: TC-0001-002")));
    }

    #[test]
    fn passes_when_required_cases_have_tests_and_skips_docs_and_vendored_dirs() {
        let project = Project::new(&[
            ("docs/test/0001_example.md", DOC),
            ("docs/test/notes.txt", "tc_0001_002"),
            (
                "crates/core/src/round.rs",
                "#[test]\nfn tc_0001_001_rounds_start_up() {}\n",
            ),
            ("node_modules/pkg/index.js", "tc_0001_002"),
            ("target/debug/out.rs", "tc_0001_002"),
        ]);
        let outcome = project.run(&[]);
        assert_eq!(outcome.code, 0, "{:?}", outcome.err);
        assert!(outcome.out[0].contains("ケース 1/2 件"));
        assert!(outcome.out[0].contains("必須 1/1 件"));
    }

    #[test]
    fn skips_binary_files() {
        let project = Project::new(&[
            ("docs/test/0001_example.md", DOC),
            ("src/blob.bin", "\0tc_0001_001"),
        ]);
        assert_eq!(project.run(&[]).code, 1);
    }

    #[test]
    fn unknown_ids_warn_by_default_fail_with_strict_and_respect_only() {
        let project = Project::new(&[
            ("docs/test/0001_example.md", DOC),
            (
                "src/a.rs",
                "fn tc_0001_001() {}\nfn tc_0001_099() {}\nfn tc_0002_001() {}\n",
            ),
        ]);
        assert_eq!(project.run(&[]).code, 0);
        let strict = project.run(&["--strict"]);
        assert_eq!(strict.code, 1);
        assert_eq!(ids_in(&strict.err), vec!["TC-0001-099", "TC-0002-001"]);
        let only = project.run(&["--strict", "--only", "0001"]);
        assert_eq!(only.code, 1);
        assert_eq!(ids_in(&only.err), vec!["TC-0001-099"]);
    }

    #[test]
    fn only_skips_documents_with_other_numbers() {
        let project = Project::new(&[
            ("docs/test/0001_example.md", DOC),
            (
                "docs/test/0002_other.md",
                "### TC-0002-001 a\n- 優先度: 必須\n",
            ),
            ("src/a.rs", "fn tc_0001_001() {}"),
        ]);
        assert_eq!(project.run(&[]).code, 1);
        assert_eq!(project.run(&["--only", "0001"]).code, 0);
    }

    #[test]
    fn duplicate_ids_are_format_errors() {
        let project = Project::new(&[
            ("docs/test/0001_a.md", "### TC-0001-001 a\n- 優先度: 必須\n"),
            ("docs/test/0001_b.md", "### TC-0001-001 b\n- 優先度: 必須\n"),
        ]);
        let outcome = project.run(&[]);
        assert_eq!(outcome.code, 2);
        assert!(outcome.err[0].contains("重複"));
    }

    #[test]
    fn missing_docs_dir_and_bad_arguments_exit_with_two() {
        let project = Project::new(&[("src/a.rs", "")]);
        assert_eq!(project.run(&[]).code, 2);
        assert_eq!(project.run(&["--unknown"]).code, 2);
        assert_eq!(project.run(&["--help"]).code, 0);
    }

    #[test]
    fn parses_arguments() {
        let args = |v: &[&str]| v.iter().map(|s| s.to_string()).collect::<Vec<_>>();
        assert!(parse_arguments(&args(&["--only", "1"])).is_err());
        assert!(parse_arguments(&args(&["--docs"])).is_err());
        assert_eq!(
            parse_arguments(&args(&["--src", "a", "--src", "b"]))
                .unwrap()
                .src,
            vec!["a", "b"]
        );
        assert_eq!(parse_arguments(&[]).unwrap().src, vec!["."]);
    }
}

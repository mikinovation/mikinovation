use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};

use check_test_ids::{run, Outcome};

const DOC: &str = "### TC-0001-001 始業を切り上げて丸める

- 期待: 10:00 になる

### TC-0001-002 終業を切り捨てて丸める

- 期待: 19:00 になる
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

fn ids_in(messages: &[String]) -> Vec<&str> {
    messages
        .iter()
        .filter_map(|m| m.find("TC-").map(|i| &m[i..i + 11]))
        .collect()
}

#[test]
fn fails_on_every_case_without_a_test() {
    let project = Project::new(&[
        ("docs/test/0001_example.md", DOC),
        ("src/lib.rs", "fn tc_0001_001() {}"),
    ]);
    let outcome = project.run(&[]);
    assert_eq!(outcome.code, 1);
    assert_eq!(
        outcome.err,
        ["エラー: TC-0001-002（docs/test/0001_example.md:5）に対応するテストがありません。"]
    );
    assert_eq!(outcome.out, ["ケース 1/2 件にテストがあります。"]);
}

#[test]
fn passes_when_every_case_has_a_test_and_skips_docs_and_vendored_dirs() {
    let project = Project::new(&[
        ("docs/test/0001_example.md", DOC),
        ("docs/test/notes.txt", "tc_0001_002"),
        (
            "crates/core/src/round.rs",
            "#[test]\nfn tc_0001_001_rounds_start_up() {}\n",
        ),
        ("web/round.test.ts", "test(\"TC-0001-002 終業\", () => {});"),
        ("node_modules/pkg/index.js", "tc_0001_003"),
        ("target/debug/out.rs", "tc_0001_003"),
    ]);
    let outcome = project.run(&["--strict"]);
    assert_eq!(outcome.code, 0, "{:?}", outcome.err);
    assert_eq!(outcome.out, ["ケース 2/2 件にテストがあります。"]);
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
            "fn tc_0001_001() {}\nfn tc_0001_002() {}\nfn tc_0001_099() {}\nfn tc_0002_001() {}\n",
        ),
    ]);
    assert_eq!(project.run(&[]).code, 0);
    let strict = project.run(&["--strict"]);
    assert_eq!(strict.code, 1);
    assert_eq!(ids_in(&strict.err), ["TC-0001-099", "TC-0002-001"]);
    let only = project.run(&["--strict", "--only", "0001"]);
    assert_eq!(only.code, 1);
    assert_eq!(ids_in(&only.err), ["TC-0001-099"]);
}

#[test]
fn only_skips_documents_with_other_numbers() {
    let project = Project::new(&[
        ("docs/test/0001_example.md", DOC),
        ("docs/test/0002_other.md", "### TC-0002-001 a\n"),
        ("src/a.rs", "fn tc_0001_001() {}\nfn tc_0001_002() {}"),
    ]);
    assert_eq!(project.run(&[]).code, 1);
    assert_eq!(project.run(&["--only", "0001"]).code, 0);
}

#[test]
fn format_errors_exit_with_two() {
    let project = Project::new(&[
        ("docs/test/0001_a.md", "### TC-0001-001 a\n"),
        ("docs/test/0001_b.md", "### TC-0001-001 b\n"),
    ]);
    let outcome = project.run(&[]);
    assert_eq!(outcome.code, 2);
    assert_eq!(
        outcome.err,
        ["書式: docs/test/0001_b.md:1: TC-0001-001 は docs/test/0001_a.md:1 と重複しています。"]
    );
}

#[test]
fn usage_errors_exit_with_two_and_help_exits_with_zero() {
    let project = Project::new(&[("src/a.rs", "")]);
    assert_eq!(project.run(&[]).code, 2);
    assert_eq!(project.run(&["--unknown"]).code, 2);
    assert_eq!(project.run(&["--help"]).code, 0);
}

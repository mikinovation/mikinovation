import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { findCodeReferences, parseArguments, parseCaseDocument, run, UsageError } from "./check-test-ids.mjs";

const DOC = `# テストケース: 例

## 集計

### TC-0001-001 始業を切り上げて丸める

- 要求: PRD 0007 要求6
- 優先度: 必須
- 期待: 10:00 になる

### TC-0001-002 終業を切り捨てて丸める

- 優先度: 任意

## 廃止したケース

- TC-0001-003: 要求6に統合した
`;

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "check-test-ids-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

test("見出しのケースと優先度を読み、廃止の箇条書きはケースにしない", () => {
  const { cases, errors } = parseCaseDocument(DOC, "docs/test/0001_example.md");
  assert.deepEqual(errors, []);
  assert.deepEqual(
    cases.map((c) => [c.id, c.priority, c.line]),
    [
      ["TC-0001-001", "必須", 5],
      ["TC-0001-002", "任意", 11],
    ],
  );
});

test("優先度の欠落、不正な値、文書番号との不一致を書式の誤りにする", () => {
  const text = "### TC-0001-001 a\n\n### TC-0001-002 b\n- 優先度: 高\n\n### TC-0002-001 c\n- 優先度: 必須\n";
  const { errors } = parseCaseDocument(text, "docs/test/0001_x.md");
  assert.equal(errors.length, 3);
  assert.match(errors[0], /TC-0001-001 に「- 優先度/);
  assert.match(errors[1], /優先度「高」/);
  assert.match(errors[2], /TC-0002-001 の番号が文書の番号 0001/);
});

test("次の見出しより後の優先度の行は前のケースに数えない", () => {
  const text = "### TC-0001-001 a\n\n#### 補足\n- 優先度: 必須\n";
  const { errors } = parseCaseDocument(text, "docs/test/0001_x.md");
  assert.equal(errors.length, 1);
});

test("コードの中の ID を言語ごとの書き方から正規化して拾う", () => {
  const code = [
    "fn tc_0001_014_rounds_start_up() {}",
    'test("TC-0001-015 終業", () => {});',
    'it("tc-0001-016", function() end)',
    "fn test_tc_0001_017() {}",
    "let atc_0001_018 = 1;",
    "tc_0001_0190",
  ].join("\n");
  assert.deepEqual([...findCodeReferences(code)].sort(), [
    "TC-0001-014",
    "TC-0001-015",
    "TC-0001-016",
    "TC-0001-017",
  ]);
});

test("必須のケースにテストがなければ終了コード 1、任意は警告にとどめる", () => {
  const root = project({ "docs/test/0001_example.md": DOC, "src/lib.rs": "fn x() {}" });
  const result = run([], root);
  assert.equal(result.code, 1);
  assert.equal(result.err.length, 1);
  assert.match(result.err[0], /TC-0001-001（docs\/test\/0001_example.md:5）/);
  assert.match(result.out[0], /ケース 0\/2 件.*必須 0\/1 件/);
  assert.ok(result.out.some((line) => /警告: TC-0001-002/.test(line)));
});

test("必須のケースがすべてテストにあれば合格し、文書の中の ID はテストに数えない", () => {
  const root = project({
    "docs/test/0001_example.md": DOC,
    "docs/test/notes.txt": "tc_0001_002",
    "crates/core/src/round.rs": "#[test]\nfn tc_0001_001_rounds_start_up() {}\n",
    "node_modules/pkg/index.js": "tc_0001_002",
  });
  const result = run([], root);
  assert.equal(result.code, 0);
  assert.match(result.out[0], /ケース 1\/2 件.*必須 1\/1 件/);
});

test("文書にない ID は既定で警告、--strict でエラーにし、--only の範囲外は無視する", () => {
  const root = project({
    "docs/test/0001_example.md": DOC,
    "src/a.rs": "fn tc_0001_001() {}\nfn tc_0001_099() {}\nfn tc_0002_001() {}\n",
  });
  assert.equal(run([], root).code, 0);
  const strict = run(["--strict"], root);
  assert.equal(strict.code, 1);
  assert.equal(strict.err.length, 2);
  const only = run(["--strict", "--only", "0001"], root);
  assert.equal(only.code, 1);
  assert.deepEqual(
    only.err.map((e) => e.match(/TC-\d{4}-\d{3}/)[0]),
    ["TC-0001-099"],
  );
});

test("ID の重複は書式の誤りとして終了コード 2 にする", () => {
  const root = project({
    "docs/test/0001_a.md": "### TC-0001-001 a\n- 優先度: 必須\n",
    "docs/test/0001_b.md": "### TC-0001-001 b\n- 優先度: 必須\n",
  });
  const result = run([], root);
  assert.equal(result.code, 2);
  assert.match(result.err[0], /重複/);
});

test("引数の誤りは UsageError にする", () => {
  assert.throws(() => parseArguments(["--only", "1"]), UsageError);
  assert.throws(() => parseArguments(["--docs"]), UsageError);
  assert.throws(() => parseArguments(["--unknown"]), UsageError);
  assert.deepEqual(parseArguments(["--src", "a", "--src", "b"]).src, ["a", "b"]);
});

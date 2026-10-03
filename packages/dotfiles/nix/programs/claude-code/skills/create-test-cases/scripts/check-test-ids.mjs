#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CASE_HEADING = /^#{2,6}\s+(TC-(\d{4})-(\d{3}))(?!\d)/;
const PRIORITY_LINE = /^\s*[-*]\s*優先度\s*[:：]\s*(\S+)/;
const ANY_HEADING = /^#{1,6}\s/;
const CODE_ID = /(?<![A-Za-z0-9])tc[-_](\d{4})[-_](\d{3})(?!\d)/gi;
const PRIORITIES = new Set(["必須", "任意"]);
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "target",
  "dist",
  "build",
  ".next",
  ".direnv",
  "result",
  "coverage",
]);
const MAX_FILE_BYTES = 2 * 1024 * 1024;

const USAGE = `使い方: check-test-ids.mjs [--docs <dir>] [--src <dir>]... [--only <番号>]... [--strict]

  --docs <dir>    テストケース文書のディレクトリ（既定: docs/test）
  --src <dir>     テストコードを探すディレクトリ。複数指定可（既定: .）
  --only <番号>   照合する文書の番号（例: 0001）。複数指定可
  --strict        文書にない ID がコードにある場合もエラーにする

終了コード: 0 合格、1 照合の不一致、2 引数または文書の書式の誤り`;

export function parseArguments(args) {
  const options = { docs: "docs/test", src: [], only: [], strict: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--strict") {
      options.strict = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--docs" || arg === "--src" || arg === "--only") {
      const value = args[++i];
      if (value === undefined) throw new UsageError(`${arg} に値がありません。`);
      if (arg === "--docs") options.docs = value;
      if (arg === "--src") options.src.push(value);
      if (arg === "--only") {
        if (!/^\d{4}$/.test(value)) throw new UsageError(`--only は4桁の番号で指定してください: ${value}`);
        options.only.push(value);
      }
      continue;
    }
    throw new UsageError(`不明な引数です: ${arg}`);
  }
  if (options.src.length === 0) options.src.push(".");
  return options;
}

export class UsageError extends Error {}

export function parseCaseDocument(text, file) {
  const cases = [];
  const errors = [];
  const docNumber = basename(file).match(/^(\d{4})_/)?.[1];
  if (!docNumber) errors.push(`${file}: ファイル名が <4桁の番号>_<タイトル>.md の形ではありません。`);

  let current;
  const lines = text.split(/\r?\n/);
  const finish = () => {
    if (!current) return;
    if (!current.priority) {
      errors.push(`${file}:${current.line}: ${current.id} に「- 優先度: 必須|任意」の行がありません。`);
    } else if (!PRIORITIES.has(current.priority)) {
      errors.push(`${file}:${current.line}: ${current.id} の優先度「${current.priority}」は 必須 か 任意 にしてください。`);
    }
    cases.push(current);
    current = undefined;
  };

  lines.forEach((line, index) => {
    const heading = line.match(CASE_HEADING);
    if (heading) {
      finish();
      current = { id: heading[1], docNumber: heading[2], file, line: index + 1 };
      if (docNumber && heading[2] !== docNumber) {
        errors.push(`${file}:${index + 1}: ${heading[1]} の番号が文書の番号 ${docNumber} と一致しません。`);
      }
      return;
    }
    if (ANY_HEADING.test(line)) {
      finish();
      return;
    }
    if (current && current.priority === undefined) {
      const priority = line.match(PRIORITY_LINE);
      if (priority) current.priority = priority[1];
    }
  });
  finish();
  return { cases, errors };
}

export function loadCases(docsDir, only = [], show = (path) => path) {
  const cases = new Map();
  const errors = [];
  let files;
  try {
    files = readdirSync(docsDir).filter((name) => extname(name) === ".md").sort();
  } catch {
    throw new UsageError(`テストケース文書のディレクトリがありません: ${docsDir}`);
  }
  for (const name of files) {
    const number = name.match(/^(\d{4})_/)?.[1];
    if (only.length > 0 && !only.includes(number)) continue;
    const path = join(docsDir, name);
    const file = show(path);
    const parsed = parseCaseDocument(readFileSync(path, "utf8"), file);
    errors.push(...parsed.errors);
    for (const testCase of parsed.cases) {
      const existing = cases.get(testCase.id);
      if (existing) {
        errors.push(`${file}:${testCase.line}: ${testCase.id} は ${existing.file}:${existing.line} と重複しています。`);
        continue;
      }
      cases.set(testCase.id, testCase);
    }
  }
  return { cases, errors };
}

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0);
}

export function* walkSourceFiles(root, excluded) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    throw new UsageError(`探索するディレクトリがありません: ${root}`);
  }
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (excluded.has(resolve(path))) continue;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkSourceFiles(path, excluded);
      continue;
    }
    if (!entry.isFile() || extname(entry.name) === ".md") continue;
    if (statSync(path).size > MAX_FILE_BYTES) continue;
    yield path;
  }
}

export function findCodeReferences(text) {
  const ids = new Set();
  for (const match of text.matchAll(CODE_ID)) ids.add(`TC-${match[1]}-${match[2]}`);
  return ids;
}

export function collectReferences(srcDirs, docsDir) {
  const references = new Map();
  const excluded = new Set([resolve(docsDir)]);
  for (const root of srcDirs) {
    for (const file of walkSourceFiles(root, excluded)) {
      const buffer = readFileSync(file);
      if (isBinary(buffer)) continue;
      for (const id of findCodeReferences(buffer.toString("utf8"))) {
        if (!references.has(id)) references.set(id, []);
        references.get(id).push(file);
      }
    }
  }
  return references;
}

export function compare(cases, references, { only = [], strict = false } = {}) {
  const errors = [];
  const warnings = [];
  for (const testCase of cases.values()) {
    if (references.has(testCase.id)) continue;
    const message = `${testCase.id}（${testCase.file}:${testCase.line}）に対応するテストがありません。`;
    if (testCase.priority === "必須") errors.push(message);
    else warnings.push(message);
  }
  for (const [id, files] of references) {
    if (cases.has(id)) continue;
    if (only.length > 0 && !only.includes(id.slice(3, 7))) continue;
    const message = `${id} は文書にないケースです（${files.join(", ")}）。`;
    if (strict) errors.push(message);
    else warnings.push(message);
  }
  return { errors, warnings };
}

export function run(args, cwd = process.cwd()) {
  const options = parseArguments(args);
  if (options.help) return { code: 0, out: [USAGE], err: [] };
  const docsDir = resolve(cwd, options.docs);
  const srcDirs = options.src.map((dir) => resolve(cwd, dir));
  const shown = (path) => relative(cwd, path) || ".";

  const loaded = loadCases(docsDir, options.only, shown);
  if (loaded.errors.length > 0) {
    return { code: 2, out: [], err: loaded.errors.map((e) => `書式: ${e}`) };
  }
  const references = collectReferences(srcDirs, docsDir);
  for (const [id, files] of references) references.set(id, files.map(shown));
  const result = compare(loaded.cases, references, options);

  const total = loaded.cases.size;
  const covered = [...loaded.cases.keys()].filter((id) => references.has(id)).length;
  const required = [...loaded.cases.values()].filter((c) => c.priority === "必須");
  const requiredCovered = required.filter((c) => references.has(c.id)).length;
  const out = [
    `ケース ${covered}/${total} 件にテストがあります（必須 ${requiredCovered}/${required.length} 件）。`,
    ...result.warnings.map((w) => `警告: ${w}`),
  ];
  const err = result.errors.map((e) => `エラー: ${e}`);
  return { code: err.length > 0 ? 1 : 0, out, err };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { code, out, err } = run(process.argv.slice(2));
    for (const line of out) console.log(line);
    for (const line of err) console.error(line);
    process.exitCode = code;
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(error.message);
    console.error(USAGE);
    process.exitCode = 2;
  }
}

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { narHash } from "./nar-hash.mjs";
import { npmDepsHash } from "./npm-deps-hash.mjs";

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, TZ: "UTC" },
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

export async function githubSrcHash(repo, ref, lockSubpath) {
  const work = mkdtempSync(join(tmpdir(), "github-src-"));
  try {
    const clone = join(work, "repo");
    mkdirSync(clone);
    git(clone, "init", "-q");
    git(clone, "fetch", "-q", "--depth", "1", `https://github.com/${repo}.git`, ref);
    const rev = git(clone, "rev-parse", "FETCH_HEAD");
    const date = git(clone, "log", "-1", "--date=format-local:%Y-%m-%d", "--format=%cd", rev);
    const src = join(work, "src");
    mkdirSync(src);
    execFileSync("sh", ["-c", `git -C "$1" archive "$2" | tar x -C "$3"`, "sh", clone, rev, src]);
    const result = { rev, date, hash: narHash(src) };
    if (lockSubpath) result.npmDepsHash = await npmDepsHash(join(src, lockSubpath));
    return result;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [repo, ref = "HEAD", lockSubpath] = process.argv.slice(2);
  if (!repo) {
    console.error("usage: node github-src-hash.mjs <owner/repo> [ref] [package-lock.json のリポジトリ内パス]");
    process.exit(1);
  }
  console.log(JSON.stringify(await githubSrcHash(repo, ref, lockSubpath), null, 2));
}

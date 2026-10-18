import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { narHash } from "./nar-hash.mjs";

const ALGOS = ["sha1", "sha512"];

function hashSegments(base, hex) {
  return join(base, hex.slice(0, 2), hex.slice(2, 4), hex.slice(4));
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function bestIntegrity(integrity, name) {
  const hashes = (integrity ?? "").split(/\s+/).filter(Boolean);
  if (hashes.length === 0) throw new Error(`${name} に integrity がない`);
  return hashes.reduce((best, h) =>
    ALGOS.indexOf(h.split("-")[0]) > ALGOS.indexOf(best.split("-")[0]) ? h : best,
  );
}

function collectPackages(lock) {
  if (![2, 3].includes(lock.lockfileVersion)) {
    throw new Error(`未対応の lockfileVersion: ${lock.lockfileVersion}`);
  }
  const byUrl = new Map();
  for (const [path, pkg] of Object.entries(lock.packages ?? {})) {
    if (path === "" || typeof pkg.resolved !== "string") continue;
    const url = parseUrl(pkg.resolved);
    if (!url || url.protocol === "file:") continue;
    if (!["http:", "https:"].includes(url.protocol) || /^(github|gitlab|bitbucket)\./.test(url.hostname)) {
      throw new Error(`git 依存は未対応: ${path} -> ${pkg.resolved}`);
    }
    const integrity = bestIntegrity(pkg.integrity, path);
    const prev = byUrl.get(url.href);
    if (!prev || ALGOS.indexOf(integrity.split("-")[0]) > ALGOS.indexOf(prev.split("-")[0])) {
      byUrl.set(url.href, integrity);
    }
  }
  return [...byUrl.entries()].map(([url, integrity]) => ({ url, integrity }));
}

async function fetchTarball(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt >= 4) throw new Error(`${url} の取得に失敗: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
    }
  }
}

function put(cache, url, data, integrity) {
  const idx = integrity.indexOf("-");
  const algo = integrity.slice(0, idx);
  const digest = Buffer.from(integrity.slice(idx + 1), "base64");
  if (!createHash(algo).update(data).digest().equals(digest)) {
    throw new Error(`${url} の integrity が一致しない`);
  }

  const contentPath = hashSegments(join(cache, "content-v2", algo), digest.toString("hex"));
  mkdirSync(dirname(contentPath), { recursive: true });
  writeFileSync(contentPath, data);

  const key = `make-fetch-happen:request-cache:${url}`;
  const indexPath = hashSegments(join(cache, "index-v5"), createHash("sha256").update(key).digest("hex"));
  mkdirSync(dirname(indexPath), { recursive: true });
  const entry = JSON.stringify({
    key,
    integrity,
    time: 0,
    size: data.length,
    metadata: { url, options: { compress: true } },
  });
  const prefix = existsSync(indexPath) && statSync(indexPath).size > 0 ? "\n" : "";
  appendFileSync(indexPath, `${prefix}${createHash("sha1").update(entry).digest("hex")}\t${entry}`);
}

export async function npmDepsHash(lockPath) {
  const content = readFileSync(lockPath, "utf8");
  const packages = collectPackages(JSON.parse(content));
  const out = mkdtempSync(join(tmpdir(), "npm-deps-"));
  try {
    const cache = join(out, "_cacache");
    mkdirSync(join(cache, "content-v2"), { recursive: true });
    mkdirSync(join(cache, "index-v5"), { recursive: true });
    const queue = [...packages];
    await Promise.all(
      Array.from({ length: 8 }, async () => {
        for (let pkg = queue.shift(); pkg; pkg = queue.shift()) {
          pkg.data = await fetchTarball(pkg.url);
        }
      }),
    );
    for (const { url, data, integrity } of packages) put(cache, url, data, integrity);
    writeFileSync(join(out, "package-lock.json"), content);
    return narHash(out);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) {
    console.error("usage: node npm-deps-hash.mjs <package-lock.json>");
    process.exit(1);
  }
  console.log(await npmDepsHash(process.argv[2]));
}

import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, readlinkSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

function str(hash, value) {
  const buf = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  const len = Buffer.alloc(8);
  len.writeBigUInt64LE(BigInt(buf.length));
  hash.update(len);
  hash.update(buf);
  const pad = (8 - (buf.length % 8)) % 8;
  if (pad) hash.update(Buffer.alloc(pad));
}

function serialize(hash, path) {
  const st = lstatSync(path);
  str(hash, "(");
  if (st.isSymbolicLink()) {
    str(hash, "type");
    str(hash, "symlink");
    str(hash, "target");
    str(hash, readlinkSync(path));
  } else if (st.isDirectory()) {
    str(hash, "type");
    str(hash, "directory");
    const names = readdirSync(path).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
    for (const name of names) {
      str(hash, "entry");
      str(hash, "(");
      str(hash, "name");
      str(hash, name);
      str(hash, "node");
      serialize(hash, join(path, name));
      str(hash, ")");
    }
  } else {
    str(hash, "type");
    str(hash, "regular");
    if (st.mode & 0o111) {
      str(hash, "executable");
      str(hash, "");
    }
    str(hash, "contents");
    str(hash, readFileSync(path));
  }
  str(hash, ")");
}

export function narHash(path) {
  const hash = createHash("sha256");
  str(hash, "nix-archive-1");
  serialize(hash, path);
  return `sha256-${hash.digest("base64")}`;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) {
    console.error("usage: node nar-hash.mjs <path>");
    process.exit(1);
  }
  console.log(narHash(process.argv[2]));
}

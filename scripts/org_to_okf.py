#!/usr/bin/env python3
"""Convert org-roam notes under roam/*.org into an OKF v0.2 markdown bundle.

Each org-roam note carries :ID:/:ROAM_ORIGIN: properties and, optionally, an
embedded YAML block (#+begin_src yaml ... #+end_src) holding OKF metadata
(type/description/tags/timestamp). This script rewrites each note as a
concept document with real frontmatter at the top of the file, resolves
org-roam [[id:...]] links into markdown links between the generated files,
and expresses ROAM_ORIGIN as a trailing "Origin" link so the relationship
still shows up as a graph edge in OKF's markdown-link-based viewer.
"""

import argparse
import pathlib
import re
import sys
from dataclasses import dataclass, field

PROPERTIES_RE = re.compile(r":PROPERTIES:\n(.*?):END:\n", re.DOTALL)
TITLE_RE = re.compile(r"^#\+TITLE:\s*(.+)$", re.MULTILINE)
META_BLOCK_RE = re.compile(
    r"^#\+begin_src yaml\n(.*?)\n^#\+end_src\n?", re.DOTALL | re.MULTILINE
)
SRC_BLOCK_RE = re.compile(
    r"^#\+begin_src(?: (\S+))?\n(.*?)^#\+end_src\n?", re.DOTALL | re.MULTILINE
)
LINK_RE = re.compile(r"\[\[id:([0-9a-fA-F-]{36})\](?:\[([^\]]*)\])?\]")


@dataclass
class Note:
    source_path: pathlib.Path
    id: str
    roam_origin: str | None
    title: str
    type: str | None
    description: str | None
    tags: list[str] = field(default_factory=list)
    timestamp: str | None = None
    body: str = ""

    @property
    def md_filename(self) -> str:
        return self.source_path.stem + ".md"


def parse_meta_yaml(block: str) -> dict:
    meta: dict = {}
    for line in block.splitlines():
        if not line.strip() or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if key == "tags":
            inner = value.strip("[]")
            meta["tags"] = [t.strip() for t in inner.split(",") if t.strip()]
        elif value:
            meta[key] = value
    return meta


def parse_org_note(path: pathlib.Path) -> Note:
    content = path.read_text(encoding="utf-8")

    props_match = PROPERTIES_RE.search(content)
    if not props_match:
        raise ValueError(f"{path}: missing :PROPERTIES: block")
    props_block = props_match.group(1)
    id_match = re.search(r":ID:\s*(\S+)", props_block)
    if not id_match:
        raise ValueError(f"{path}: missing :ID: property")
    note_id = id_match.group(1)
    origin_match = re.search(r":ROAM_ORIGIN:\s*(\S+)", props_block)
    roam_origin = origin_match.group(1) if origin_match else None

    title_match = TITLE_RE.search(content)
    title = title_match.group(1).strip() if title_match else path.stem

    meta_match = META_BLOCK_RE.search(content)
    meta = parse_meta_yaml(meta_match.group(1)) if meta_match else {}

    body = content[props_match.end() :]
    body = TITLE_RE.sub("", body, count=1)
    if meta_match:
        body = body.replace(meta_match.group(0), "", 1)
    body = body.strip("\n")

    return Note(
        source_path=path,
        id=note_id,
        roam_origin=roam_origin,
        title=title,
        type=meta.get("type"),
        description=meta.get("description"),
        tags=meta.get("tags", []),
        timestamp=meta.get("timestamp"),
        body=body,
    )


def convert_src_blocks(body: str) -> str:
    return SRC_BLOCK_RE.sub(
        lambda m: f"```{m.group(1) or ''}\n{m.group(2)}```\n", body
    )


def convert_links(body: str, id_map: dict[str, Note], source_path: pathlib.Path) -> str:
    def replace(m: re.Match) -> str:
        target_id, label = m.group(1), m.group(2)
        target = id_map.get(target_id)
        if target is None:
            print(
                f"warning: {source_path}: unresolved link id:{target_id}",
                file=sys.stderr,
            )
            return m.group(0)
        return f"[{label or target.title}]({target.md_filename})"

    return LINK_RE.sub(replace, body)


def yaml_scalar(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def render_markdown(note: Note, id_map: dict[str, Note]) -> str:
    frontmatter = ["---", f"type: {note.type or 'note'}", f"title: {yaml_scalar(note.title)}"]
    if note.description:
        frontmatter.append(f"description: {yaml_scalar(note.description)}")
    if note.tags:
        frontmatter.append(f"tags: [{', '.join(note.tags)}]")
    if note.timestamp:
        frontmatter.append(f"timestamp: {note.timestamp}")
    frontmatter.append("---")

    body = convert_links(convert_src_blocks(note.body), id_map, note.source_path)

    parts = ["\n".join(frontmatter), "", body]

    if note.roam_origin:
        origin = id_map.get(note.roam_origin)
        if origin is None:
            print(
                f"warning: {note.source_path}: unresolved ROAM_ORIGIN id:{note.roam_origin}",
                file=sys.stderr,
            )
        else:
            parts += ["", "---", "", f"Origin: [{origin.title}]({origin.md_filename})"]

    return "\n".join(parts).rstrip("\n") + "\n"


def convert_bundle(roam_dir: pathlib.Path, out_dir: pathlib.Path) -> int:
    org_files = sorted(roam_dir.glob("*.org"))
    if not org_files:
        print(f"no .org files found in {roam_dir}", file=sys.stderr)
        return 1

    notes = [parse_org_note(p) for p in org_files]
    id_map = {note.id: note for note in notes}

    out_dir.mkdir(parents=True, exist_ok=True)
    for note in notes:
        out_path = out_dir / note.md_filename
        out_path.write_text(render_markdown(note, id_map), encoding="utf-8")
        print(f"wrote {out_path}")

    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert org-roam notes (roam/*.org) into an OKF markdown bundle."
    )
    parser.add_argument("--roam-dir", type=pathlib.Path, default=pathlib.Path("roam"))
    parser.add_argument("--out", type=pathlib.Path, default=pathlib.Path("okf"))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    sys.exit(convert_bundle(args.roam_dir, args.out))


if __name__ == "__main__":
    main()

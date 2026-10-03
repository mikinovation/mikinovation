use std::collections::BTreeMap;
use std::fs::{self, DirEntry};
use std::path::{Path, PathBuf};

use crate::case_id::CaseId;
use crate::workspace::Workspace;
use crate::Error;

const SKIPPED_DIRS: &[&str] = &[
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

pub type References = BTreeMap<CaseId, Vec<String>>;

pub fn scan(workspace: &Workspace) -> Result<References, Error> {
    let mut references = References::new();
    for root in &workspace.src_dirs {
        for path in source_files(root, &workspace.docs_dir)? {
            let Some(content) = read_text(&path) else {
                continue;
            };
            for id in CaseId::find_in_code(&content) {
                references
                    .entry(id)
                    .or_default()
                    .push(workspace.display(&path));
            }
        }
    }
    Ok(references)
}

fn source_files(root: &Path, docs_dir: &Path) -> Result<Vec<PathBuf>, Error> {
    let mut files = Vec::new();
    collect_source_files(root, docs_dir, &mut files)?;
    Ok(files)
}

fn collect_source_files(
    dir: &Path,
    docs_dir: &Path,
    files: &mut Vec<PathBuf>,
) -> Result<(), Error> {
    let entries = fs::read_dir(dir).map_err(|_| {
        Error::Usage(format!(
            "探索するディレクトリがありません: {}",
            dir.display()
        ))
    })?;
    let mut entries: Vec<DirEntry> = entries.filter_map(Result::ok).collect();
    entries.sort_by_key(DirEntry::file_name);
    for entry in entries {
        let path = entry.path();
        let Ok(file_type) = entry.file_type() else {
            continue;
        };
        if path == docs_dir {
            continue;
        }
        if file_type.is_dir() && !is_skipped_dir(&entry) {
            collect_source_files(&path, docs_dir, files)?;
        } else if file_type.is_file() && is_source_file(&entry) {
            files.push(path);
        }
    }
    Ok(())
}

fn is_skipped_dir(entry: &DirEntry) -> bool {
    SKIPPED_DIRS.iter().any(|name| entry.file_name() == *name)
}

fn is_source_file(entry: &DirEntry) -> bool {
    let is_markdown = entry.path().extension().is_some_and(|ext| ext == "md");
    let is_too_large = entry.metadata().is_ok_and(|m| m.len() > MAX_FILE_BYTES);
    !is_markdown && !is_too_large
}

fn read_text(path: &Path) -> Option<Vec<u8>> {
    let content = fs::read(path).ok()?;
    let probe = &content[..content.len().min(BINARY_PROBE_BYTES)];
    let is_binary = probe.contains(&0);
    (!is_binary).then_some(content)
}

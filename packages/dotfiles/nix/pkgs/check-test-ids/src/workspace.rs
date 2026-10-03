use std::path::{Path, PathBuf};

use crate::cli::Options;

pub struct Workspace {
    root: PathBuf,
    pub docs_dir: PathBuf,
    pub src_dirs: Vec<PathBuf>,
}

impl Workspace {
    pub fn new(cwd: &Path, options: &Options) -> Self {
        let root = canonical(cwd.to_path_buf());
        Workspace {
            docs_dir: canonical(root.join(&options.docs)),
            src_dirs: options
                .src
                .iter()
                .map(|dir| canonical(root.join(dir)))
                .collect(),
            root,
        }
    }

    pub fn display(&self, path: &Path) -> String {
        match path.strip_prefix(&self.root) {
            Ok(relative) if relative.as_os_str().is_empty() => ".".to_string(),
            Ok(relative) => relative.display().to_string(),
            Err(_) => path.display().to_string(),
        }
    }
}

fn canonical(path: PathBuf) -> PathBuf {
    path.canonicalize().unwrap_or(path)
}

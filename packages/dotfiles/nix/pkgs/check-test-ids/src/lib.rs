mod case_document;
mod case_id;
mod cli;
mod code_scan;
mod report;
mod workspace;

use std::path::Path;

use cli::Options;
use report::Report;
use workspace::Workspace;

pub use cli::USAGE;

pub struct Outcome {
    pub code: u8,
    pub out: Vec<String>,
    pub err: Vec<String>,
}

pub enum Error {
    Usage(String),
    Format(Vec<String>),
}

pub fn run(args: &[String], cwd: &Path) -> Outcome {
    let options = match Options::parse(args) {
        Ok(options) => options,
        Err(error) => return error.into_outcome(),
    };
    if options.help {
        return Outcome {
            code: 0,
            out: vec![USAGE.to_string()],
            err: Vec::new(),
        };
    }
    match check(&options, cwd) {
        Ok(report) => report.into_outcome(),
        Err(error) => error.into_outcome(),
    }
}

fn check(options: &Options, cwd: &Path) -> Result<Report, Error> {
    let workspace = Workspace::new(cwd, options);
    let cases = case_document::load(&workspace, &options.only)?;
    let references = code_scan::scan(&workspace)?;
    Ok(report::build(&cases, &references, options))
}

impl Error {
    fn into_outcome(self) -> Outcome {
        let err = match self {
            Error::Usage(message) => vec![message, USAGE.to_string()],
            Error::Format(messages) => messages.iter().map(|m| format!("書式: {m}")).collect(),
        };
        Outcome {
            code: 2,
            out: Vec::new(),
            err,
        }
    }
}

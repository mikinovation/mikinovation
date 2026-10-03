use crate::case_document::TestCase;
use crate::case_id::CaseId;
use crate::cli::Options;
use crate::code_scan::References;
use crate::Outcome;

pub struct Report {
    summary: String,
    warnings: Vec<String>,
    errors: Vec<String>,
}

enum Finding<'a> {
    MissingTest(&'a TestCase),
    UnknownId(&'a CaseId, &'a [String]),
}

enum Severity {
    Error,
    Warning,
}

pub fn build(cases: &[TestCase], references: &References, options: &Options) -> Report {
    let mut report = Report {
        summary: summary(cases, references),
        warnings: Vec::new(),
        errors: Vec::new(),
    };
    let findings =
        missing_tests(cases, references).chain(unknown_ids(cases, references, &options.only));
    for finding in findings {
        match finding.severity(options.strict) {
            Severity::Error => report.errors.push(finding.message()),
            Severity::Warning => report.warnings.push(finding.message()),
        }
    }
    report
}

fn missing_tests<'a>(
    cases: &'a [TestCase],
    references: &'a References,
) -> impl Iterator<Item = Finding<'a>> {
    cases
        .iter()
        .filter(|case| !references.contains_key(&case.id))
        .map(Finding::MissingTest)
}

fn unknown_ids<'a>(
    cases: &'a [TestCase],
    references: &'a References,
    only: &'a [String],
) -> impl Iterator<Item = Finding<'a>> {
    let in_scope = move |id: &CaseId| only.is_empty() || only.iter().any(|n| n == id.doc_number());
    references
        .iter()
        .filter(move |(id, _)| in_scope(id) && !cases.iter().any(|case| &case.id == *id))
        .map(|(id, files)| Finding::UnknownId(id, files))
}

fn summary(cases: &[TestCase], references: &References) -> String {
    let tested = cases
        .iter()
        .filter(|case| references.contains_key(&case.id))
        .count();
    format!("ケース {tested}/{} 件にテストがあります。", cases.len())
}

impl Finding<'_> {
    fn severity(&self, strict: bool) -> Severity {
        match self {
            Finding::MissingTest(_) => Severity::Error,
            Finding::UnknownId(..) if strict => Severity::Error,
            Finding::UnknownId(..) => Severity::Warning,
        }
    }

    fn message(&self) -> String {
        match self {
            Finding::MissingTest(case) => format!(
                "{}（{}）に対応するテストがありません。",
                case.id, case.location
            ),
            Finding::UnknownId(id, files) => {
                format!("{id} は文書にないケースです（{}）。", files.join(", "))
            }
        }
    }
}

impl Report {
    pub fn into_outcome(self) -> Outcome {
        let code = if self.errors.is_empty() { 0 } else { 1 };
        let mut out = vec![self.summary];
        out.extend(self.warnings.iter().map(|w| format!("警告: {w}")));
        let err = self.errors.iter().map(|e| format!("エラー: {e}")).collect();
        Outcome { code, out, err }
    }
}

use std::collections::BTreeSet;
use std::fmt;

const ID_LENGTH: usize = "TC-0001-001".len();

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct CaseId {
    doc_number: String,
    serial: String,
}

enum Notation {
    Document,
    Code,
}

impl CaseId {
    pub fn from_heading(text: &str) -> Option<Self> {
        Self::read_at(text.as_bytes(), 0, Notation::Document)
    }

    pub fn find_in_code(content: &[u8]) -> BTreeSet<Self> {
        let mut ids = BTreeSet::new();
        let mut position = 0;
        while position < content.len() {
            let starts_word = position == 0 || !content[position - 1].is_ascii_alphanumeric();
            let found = starts_word
                .then(|| Self::read_at(content, position, Notation::Code))
                .flatten();
            match found {
                Some(id) => {
                    ids.insert(id);
                    position += ID_LENGTH;
                }
                None => position += 1,
            }
        }
        ids
    }

    pub fn doc_number(&self) -> &str {
        &self.doc_number
    }

    fn read_at(bytes: &[u8], start: usize, notation: Notation) -> Option<Self> {
        let candidate = bytes.get(start..start + ID_LENGTH)?;
        let letters = &candidate[0..2];
        let doc_number = &candidate[3..7];
        let serial = &candidate[8..11];
        let followed_by_digit = bytes.get(start + ID_LENGTH).is_some_and(u8::is_ascii_digit);
        let valid = notation.accepts_letters(letters)
            && notation.accepts_separator(candidate[2])
            && notation.accepts_separator(candidate[7])
            && all_digits(doc_number)
            && all_digits(serial)
            && !followed_by_digit;
        valid.then(|| CaseId {
            doc_number: ascii(doc_number),
            serial: ascii(serial),
        })
    }
}

impl Notation {
    fn accepts_letters(&self, letters: &[u8]) -> bool {
        match self {
            Notation::Document => letters == b"TC",
            Notation::Code => letters.eq_ignore_ascii_case(b"tc"),
        }
    }

    fn accepts_separator(&self, byte: u8) -> bool {
        match self {
            Notation::Document => byte == b'-',
            Notation::Code => byte == b'-' || byte == b'_',
        }
    }
}

impl fmt::Display for CaseId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "TC-{}-{}", self.doc_number, self.serial)
    }
}

fn all_digits(bytes: &[u8]) -> bool {
    bytes.iter().all(u8::is_ascii_digit)
}

fn ascii(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_only_the_document_notation_from_headings() {
        let id = CaseId::from_heading("TC-0001-014 始業を丸める").unwrap();
        assert_eq!(id.to_string(), "TC-0001-014");
        assert_eq!(id.doc_number(), "0001");
        assert!(CaseId::from_heading("tc_0001_014").is_none());
        assert!(CaseId::from_heading("TC-0001-0140").is_none());
        assert!(CaseId::from_heading("TC-あい-001").is_none());
        assert!(CaseId::from_heading("TC-00０1-001").is_none());
    }

    #[test]
    fn finds_ids_in_each_language_style_of_code() {
        let code = [
            "fn tc_0001_014_rounds_start_up() {}",
            "test(\"TC-0001-015 終業\", () => {});",
            "it(\"tc-0001-016\", function() end)",
            "fn test_tc_0001_017() {}",
            "let atc_0001_018 = 1;",
            "tc_0001_0190",
        ]
        .join("\n");
        let ids: Vec<String> = CaseId::find_in_code(code.as_bytes())
            .iter()
            .map(CaseId::to_string)
            .collect();
        assert_eq!(
            ids,
            ["TC-0001-014", "TC-0001-015", "TC-0001-016", "TC-0001-017"]
        );
    }
}

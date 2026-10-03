use crate::Error;

pub const USAGE: &str =
    "使い方: check-test-ids [--docs <dir>] [--src <dir>]... [--only <番号>]... [--strict]

  --docs <dir>    テストケース文書のディレクトリ（既定: docs/test）
  --src <dir>     テストコードを探すディレクトリ。複数指定可（既定: .）
  --only <番号>   照合する文書の番号（例: 0001）。複数指定可
  --strict        文書にない ID がコードにある場合もエラーにする

終了コード: 0 合格、1 照合の不一致、2 引数または文書の書式の誤り";

#[derive(Debug, PartialEq, Eq)]
pub struct Options {
    pub docs: String,
    pub src: Vec<String>,
    pub only: Vec<String>,
    pub strict: bool,
    pub help: bool,
}

impl Options {
    pub fn parse(args: &[String]) -> Result<Self, Error> {
        let mut options = Options {
            docs: "docs/test".to_string(),
            src: Vec::new(),
            only: Vec::new(),
            strict: false,
            help: false,
        };
        let mut args = args.iter();
        while let Some(flag) = args.next() {
            match flag.as_str() {
                "--strict" => options.strict = true,
                "--help" | "-h" => options.help = true,
                "--docs" => options.docs = value_of(flag, args.next())?,
                "--src" => options.src.push(value_of(flag, args.next())?),
                "--only" => options.only.push(doc_number(value_of(flag, args.next())?)?),
                _ => return Err(Error::Usage(format!("不明な引数です: {flag}"))),
            }
        }
        if options.src.is_empty() {
            options.src.push(".".to_string());
        }
        Ok(options)
    }
}

fn value_of(flag: &str, value: Option<&String>) -> Result<String, Error> {
    value
        .cloned()
        .ok_or_else(|| Error::Usage(format!("{flag} に値がありません。")))
}

fn doc_number(value: String) -> Result<String, Error> {
    if value.len() == 4 && value.bytes().all(|b| b.is_ascii_digit()) {
        Ok(value)
    } else {
        Err(Error::Usage(format!(
            "--only は4桁の番号で指定してください: {value}"
        )))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(args: &[&str]) -> Result<Options, Error> {
        let args: Vec<String> = args.iter().map(|s| s.to_string()).collect();
        Options::parse(&args)
    }

    #[test]
    fn rejects_invalid_arguments() {
        assert!(parse(&["--only", "1"]).is_err());
        assert!(parse(&["--docs"]).is_err());
        assert!(parse(&["--unknown"]).is_err());
    }

    #[test]
    fn collects_repeated_values_and_defaults_src_to_current_dir() {
        assert_eq!(
            parse(&["--src", "a", "--src", "b"]).ok().unwrap().src,
            ["a", "b"]
        );
        assert_eq!(parse(&[]).ok().unwrap().src, ["."]);
    }
}

use std::process::ExitCode;

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let cwd = match std::env::current_dir() {
        Ok(cwd) => cwd,
        Err(error) => {
            eprintln!("作業ディレクトリを取得できません: {error}");
            return ExitCode::from(2);
        }
    };
    let outcome = check_test_ids::run(&args, &cwd);
    for line in &outcome.out {
        println!("{line}");
    }
    for line in &outcome.err {
        eprintln!("{line}");
    }
    ExitCode::from(outcome.code)
}

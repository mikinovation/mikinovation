{ rustPlatform }:

rustPlatform.buildRustPackage {
  pname = "check-test-ids";
  version = "0.1.0";

  src = ./check-test-ids;

  cargoLock.lockFile = ./check-test-ids/Cargo.lock;

  meta = {
    description = "Check that every test case ID in docs/test has a matching test";
    mainProgram = "check-test-ids";
  };
}

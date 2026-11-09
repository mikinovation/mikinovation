{
  stdenv,
  fetchurl,
  lib,
}:

let
  version = "0.9.5";

  sources = {
    x86_64-linux = {
      asset = "herdr-linux-x86_64";
      hash = "sha256-FNnovItKngEY13wyJm921GHwm0A0LrI3UpYL2J9Zkp0=";
    };
    aarch64-darwin = {
      asset = "herdr-macos-aarch64";
      hash = "sha256-+3fCIyoFqANUITgsiUOS9BdOTjihjkivPdApAVfDp+I=";
    };
  };
  source =
    sources.${stdenv.hostPlatform.system}
      or (throw "herdr: unsupported platform ${stdenv.hostPlatform.system}");
in
stdenv.mkDerivation {
  pname = "herdr";
  inherit version;

  # Upstream ships a flake, but building it compiles the Rust workspace plus a
  # vendored libghostty-vt through zig with ReleaseFast, which needs far more
  # memory than a small WSL2 machine has. The release assets are statically
  # linked (musl on Linux), so install them as-is.
  src = fetchurl {
    url = "https://github.com/herdrdev/herdr/releases/download/v${version}/${source.asset}";
    inherit (source) hash;
  };

  dontUnpack = true;
  dontPatchELF = true;

  installPhase = ''
    runHook preInstall

    install -Dm755 $src $out/bin/herdr

    runHook postInstall
  '';

  meta = {
    description = "Terminal workspace manager for AI coding agents";
    homepage = "https://herdr.dev";
    license = lib.licenses.asl20;
    mainProgram = "herdr";
    platforms = builtins.attrNames sources;
  };
}

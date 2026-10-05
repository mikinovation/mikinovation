{
  lib,
  stdenvNoCC,
  fetchFromGitHub,
  python3,
}:

stdenvNoCC.mkDerivation {
  pname = "yomiyasu";
  version = "0-unstable-2026-10-05";

  src = fetchFromGitHub {
    owner = "nanaism";
    repo = "yomiyasu";
    rev = "4075fc34fb0333ca1fe42d32cd619338f4a138ba";
    hash = "sha256-t5nqoxpJtyd+p4SOsSyYY5nPUrbRsuCqOj70k8M2Vuk=";
  };

  dontBuild = true;

  postPatch = ''
    substituteInPlace skills/yomiyasu/scripts/yomiyasu_lint.py skills/yomiyasu/scripts/yomiyasu_diff.py \
      --replace-fail '#!/usr/bin/env python3' '#!${lib.getExe python3}'

    substituteInPlace skills/yomiyasu/SKILL.md \
      --replace-fail 'python3 <スキル配置ディレクトリ>/scripts/' '<スキル配置ディレクトリ>/scripts/'
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out
    cp -r \
      skills/yomiyasu/SKILL.md \
      skills/yomiyasu/references \
      skills/yomiyasu/scripts \
      LICENSE \
      $out/
    chmod +x $out/scripts/*.py

    runHook postInstall
  '';

  meta = {
    description = "Agent skill for refining AI-generated Japanese into natural Japanese";
    homepage = "https://github.com/nanaism/yomiyasu";
    license = lib.licenses.mit;
  };
}

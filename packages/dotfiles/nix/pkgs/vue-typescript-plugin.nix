{
  lib,
  buildNpmPackage,
  fetchurl,
  runCommand,
}:

let
  tgz = fetchurl {
    url = "https://registry.npmjs.org/@vue/typescript-plugin/-/typescript-plugin-3.3.13.tgz";
    sha512 = "L/ht0WIIB5GOPYx0ooWoVQztsI/v1h7lW2/ND0YBuoBYHTteGPfRFzM5j0/uD1nf/rYezqWHhNDDmww2Co53KA==";
  };
in
buildNpmPackage {
  pname = "vue-typescript-plugin";
  version = "3.3.13";

  src = runCommand "vue-typescript-plugin-src" { } ''
    mkdir -p $out
    tar xzf ${tgz} -C $out --strip-components=1
    cp ${./vue-typescript-plugin-lock.json} $out/package-lock.json
  '';

  npmDepsHash = "sha256-MYaF2YPNcg7kJZ9l5fOXQbwK2bZj8CmUXfrhlE49G74=";

  dontNpmBuild = true;

  meta = {
    description = "Vue TypeScript plugin";
    homepage = "https://github.com/vuejs/language-tools";
    license = lib.licenses.mit;
  };
}

{ config, pkgs }:
{
  check.enable = true;
  settings.hooks = {
    biome = rec {
      enable = true;
      package = pkgs.biome;
      entry = "${package}/bin/biome lint --write";
    };
    nil.enable = true;
    treefmt = {
      enable = true;
      package = config.treefmt.build.wrapper;
    };
  };
}

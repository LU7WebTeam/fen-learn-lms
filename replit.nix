{ pkgs }: {
  deps = [
    pkgs.php84
    pkgs.php84Packages.composer
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.sqlite
  ];
}
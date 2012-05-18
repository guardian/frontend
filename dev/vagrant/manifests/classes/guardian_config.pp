class guardian_config {
  file {
    "/etc/gu": ensure => directory;
    "/etc/gu/install_vars": content => "STAGE=DEV\nINT_SERVICE_DOMAIN=gudev.gnl\nEXT_SERVICE_DOMAIN=\n";
  }
}

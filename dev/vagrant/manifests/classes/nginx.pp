class nginx {
  package {
    "nginx": ensure => installed;
  }

  file {
    "/etc/nginx/sites-available":
      ensure => directory,
      purge => true;

    "/etc/nginx/sites-enabled":
      ensure => directory,
      purge => true;
  }

  service {
    "nginx":
      ensure => running,
      require => Package["nginx"];
  }
}

class basic {
  group {
    "puppet": ensure => "present"
  }

  package {
    bash-completion: ensure => installed;
    curl: ensure => installed;
    tree: ensure => installed;
    vim: ensure => installed;
  }

  file {
    # Need a long timeout for Postini download virus checks
    "/etc/apt/apt.conf.d/30timeout": content => "Acquire::http::Timeout \"300\";";
    "/etc/apt/apt.conf.d/31retries": content => "Acquire::http::Retries \"3\";";
  }

  exec {
    "apt-get update": command => "/usr/bin/apt-get update"
  }
}

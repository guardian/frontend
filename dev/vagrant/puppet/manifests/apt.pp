class apt {

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    # Use UK mirrors for Ubuntu repositories
    "/etc/apt/sources.list":
      source => "puppet:///files/etc/apt/sources.list";

    # Need a long apt timeout for ScanSafe virus checks
    "/etc/apt/apt.conf.d/30timeout":
      source => "puppet:///files/etc/apt/apt.conf.d/30timeout";

    "/etc/apt/apt.conf.d/31retries":
      source => "puppet:///files/etc/apt/apt.conf.d/31retries";

    "/etc/apt/sources.list.d": ensure => directory;
  }

  exec {
    "apt-get update":
      command => "/usr/bin/apt-get update -y --fix-missing";

    "apt-get upgrade":
      command => "/usr/bin/apt-get upgrade -y"
  }

  File["/etc/apt/sources.list"] -> Exec["apt-get update"]
  File["/etc/apt/apt.conf.d/30timeout"] -> Exec["apt-get update"]
  File["/etc/apt/apt.conf.d/31retries"] -> Exec["apt-get update"]

  Exec["apt-get update"] -> Exec["apt-get upgrade"]

}
class gu {

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    "/etc/gu": ensure => directory;

    "/etc/gu/install_vars":
      source => "puppet:///files/etc/gu/install_vars";
  }

  File["/etc/gu"] -> File["/etc/gu/install_vars"]

}
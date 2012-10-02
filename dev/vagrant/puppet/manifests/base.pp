class base {

  $packages = [
     vim-enhanced,
     curl,
     unzip,
     ntp,
     rsync
  ]

  package {
    $packages: ensure => latest
  }

  service  {
    ntpd:
      enable => true,
      ensure => running;
  }

  Package[ntp] -> Service[ntpd]

}
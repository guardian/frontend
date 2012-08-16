class base {

  $packages = [
     bash-completion,
     vim,
     curl,
     unzip,
     ntp,
     git,
     openjdk-6-jdk
  ]

  package {
    $packages: ensure => latest
  }

  service  {
    ntp:
      enable => true,
      ensure => running;
  }

  Class[apt] -> Package[$packages]
  Package[ntp] -> Service[ntp]

}
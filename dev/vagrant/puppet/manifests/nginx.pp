class nginx {

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    "/etc/nginx/conf.d/frontend.conf":
       source => "puppet:///files/etc/nginx/conf.d/frontend.conf";

    "/etc/nginx/logs":
       ensure => directory;

    "/etc/nginx/conf.d/default.conf":
      ensure => absent;

    "/etc/nginx/conf.d/example_ssl.conf":
      ensure => absent;

    "/etc/apt/sources.list.d/nginx-precise.list":
      source => "puppet:///files/etc/apt/sources.list.d/nginx-precise.list";

    "/etc/apt/trusted.gpg.d/nginx.gpg":
      source => "puppet:///files/etc/apt/trusted.gpg.d/nginx.gpg";
  }

  exec {
    "nginx apt-get update":
      command => "/usr/bin/apt-get update -y --fix-missing";
  }

  package {
    nginx: ensure => latest;
  }

  service {
    nginx:
      enable => true,
      ensure => running;
  }

  File["/etc/apt/sources.list.d/nginx-precise.list"] -> Exec["nginx apt-get update"]
  File["/etc/apt/trusted.gpg.d/nginx.gpg"] -> Exec["nginx apt-get update"]

  Exec["nginx apt-get update"] -> Package[nginx]

  Package[nginx] -> File["/etc/nginx/conf.d/frontend.conf"] -> Service[nginx]
  Package[nginx] -> File["/etc/nginx/logs"] -> Service[nginx]
  Package[nginx] -> File["/etc/nginx/conf.d/default.conf"] -> Service[nginx]
  Package[nginx] -> File["/etc/nginx/conf.d/example_ssl.conf"] -> Service[nginx]

  Package[nginx] -> Service[nginx]
}

class nginx($config_template) {

  package { nginx: ensure  => installed }

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    '/var/log/nginx': ensure => directory;

    '/etc/yum.repos.d/nginx.repo':
      source => 'puppet:///files/etc/yum.repos.d/nginx.repo';

    '/etc/nginx':
      ensure => directory,
      recurse => true,
      purge => true,
      notify => Service[nginx];

    '/etc/nginx/nginx.conf':
      source => 'puppet:///files/etc/nginx/nginx.conf',
      notify => Service[nginx];

    '/etc/nginx/mime.types':
      source => 'puppet:///files/etc/nginx/mime.types',
      notify => Service[nginx];

    '/etc/nginx/conf.d/default.conf':
      content => template($config_template),
      notify => Service[nginx];
  }

  service {
    nginx:
      ensure => running,
      enable => true
  }

  File['/etc/yum.repos.d/nginx.repo'] -> Package[nginx] -> Service[nginx]

  Package[nginx] -> File['/etc/nginx/nginx.conf'] -> Service[nginx]
  Package[nginx] -> File['/etc/nginx/conf.d/default.conf'] -> Service[nginx]

}

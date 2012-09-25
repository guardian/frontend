class sudo {

  package {
    sudo: ensure => latest;
  }

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    '/etc/sudoers.d': ensure => directory;
  }

  Package[sudo] -> File['/etc/sudoers.d']
}

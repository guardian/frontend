class jvmuser {

  group {
    jvmuser: ensure => present
  }

  User {
    shell => '/bin/bash',
    managehome => true
  }

  user {
    jvmuser:
      ensure => present,
      gid => jvmuser
  }

  File {
    owner => jvmuser,
    group => jvmuser,
    mode => 0644
  }

  file {
    '/etc/sudoers.d/99-jvmuser':
      source => 'puppet:///files/etc/sudoers.d/99-jvmuser',
      owner => root,
      group => root,
      mode => 0440;
  }

  Group[jvmuser] -> User[jvmuser]
}


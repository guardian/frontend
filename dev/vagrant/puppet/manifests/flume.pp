class flume {

  require check-role-facts
  require check-aws-facts
  require check-stage-facts

  package {
    flume-ng-agent: ensure  => latest
  }

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    '/etc/yum.repos.d/cloudera-cdh3.repo':
      source => 'puppet:///files/etc/yum.repos.d/cloudera-cdh3.repo';

    '/etc/flume-ng':
      ensure => directory,
      recurse => true,
      purge => true,
      notify => Service[flume-ng-agent];

    '/etc/flume-ng/conf': ensure => directory;

    '/etc/flume-ng/conf/flume.conf':
      content => template('etc/flume-ng/conf/flume.conf.erb'),
      notify => Service[flume-ng-agent];

    '/etc/flume-ng/conf/log4j.properties':
      source => 'puppet:///files/etc/flume-ng/conf/log4j.properties',
      notify => Service[flume-ng-agent];
  }

  service {
    flume-ng-agent:
      ensure  => running,
      enable  => true
  }

  File['/etc/yum.repos.d/cloudera-cdh3.repo'] -> Package[flume-ng-agent] -> Service[flume-ng-agent]
  Package[flume-ng-agent] -> File['/etc/flume-ng/conf/flume.conf'] -> Service[flume-ng-agent]
  Package[flume-ng-agent] -> File['/etc/flume-ng/conf/log4j.properties'] -> Service[flume-ng-agent]

}

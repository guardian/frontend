class gu {

  require check-aws-facts
  require check-stage-facts

  File {
    owner => root,
    group => root,
    mode => 0644
  }

  file {
    '/etc/gu': ensure => directory;

    '/etc/gu/install_vars':
      content => template('etc/gu/install_vars.erb');

    '/etc/gu/aws.conf':
      content => template('etc/gu/aws.conf.erb');
  }
}
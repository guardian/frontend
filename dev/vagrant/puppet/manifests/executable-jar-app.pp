class executable-jar-app($role) {

  require check-role-facts

  class config {
    File {
      owner => root,
      group => root,
      mode => 0644,
      notify => Service[$role]
    }

    file {
      "/etc/init.d/$role":
        content => template('etc/init.d/frontend.erb'),
        mode => 0755;

      "/var/log/ports":
        ensure => directory,
        mode => 0777;

      [
        "/executable-jar-apps",
        "/executable-jar-apps/$role",
        "/executable-jar-apps/$role/logs"
      ]:
        ensure => directory,
        owner => jvmuser,
        group => jvmuser,
        mode => 0755;
    }
  }

  include config

  service {
    $role:
      enable => true,
      ensure => running;
  }

  Class[config] -> Service[$role]
}
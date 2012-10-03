import "manifests/*.pp"

node default {

  require check-role-facts

  include base
  include flume

  include gu
  include sudo
  include java
  include jvmuser

  class {
    executable-jar-app: role => $role
  }

  class {
    nginx: config_template => 'etc/nginx/frontend.conf.erb'
  }

  Class[base] -> Class[nginx]

  Class[base] -> Class[jvmuser]
  Class[sudo] -> Class[jvmuser]

  Class[base] -> Class[executable-jar-app]
  Class[gu] -> Class[executable-jar-app]
  Class[jvmuser] -> Class[executable-jar-app]
  Class[java] -> Class[executable-jar-app]

  Class[executable-jar-app] -> Class[flume]
}
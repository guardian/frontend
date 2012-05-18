import "classes/*.pp"

node default {
  include basic
  include guardian_config
  include nginx
  include java

  file {
    "/etc/nginx/sites-available/default":
      ensure => absent,
      notify => Service[nginx];

    "/etc/nginx/sites-enabled/default":
      ensure => absent,
      notify => Service[nginx];

    "/etc/nginx/sites-enabled/article-server":
      content => "server {\n  server_name localhost;\n  location / {\n    proxy_pass http://localhost:9000;\n  }\n}\n",
      notify => Service[nginx];
  }
}

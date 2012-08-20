import "manifests/*.pp"

node default {
  include gu
  include apt
  include base
  include nginx

  Class[apt] -> Class[base]
  Class[apt] -> Class[nginx]
}
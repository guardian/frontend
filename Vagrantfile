Vagrant::Config.run do |config|

  config.vm.box = "frontend_precise64"
  config.vm.box_url = "http://devscreen.gudev.gnl/vagrants/frontend_precise64.box"

  # config.vm.boot_mode = :gui
  config.ssh.forward_x11 = true

  config.vm.forward_port 80, 8000
  config.vm.forward_port 9000, 9000
  config.vm.forward_port 18080, 18080

end

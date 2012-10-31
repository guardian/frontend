Vagrant
=======

[Vagrant][vagrant] is a tool to "create and configure lightweight, reproducible,
and portable development environments." Vagrant itself is a virtual instance
creation and startup tool on top of Oracle VirtualBox which takes care of the
virtualisation.


Install Vagrant (Ubuntu)
------------------------
Install the Open Source Edition of VirtualBox:

    wget http://download.virtualbox.org/virtualbox/4.1.18/virtualbox-4.1_4.1.18-78361~Ubuntu~natty_amd64.deb
    sudo dpkg -i virtualbox-4.1_4.1.18-78361~Ubuntu~natty_amd64.deb

If you are using a different version of Ubuntu, substitute the appropriate
deb from the [VirtualBox download page][virtualbox-download].

Then install Vagrant itself:

    wget http://files.vagrantup.com/packages/eb590aa3d936ac71cbf9c64cf207f148ddfc000a/vagrant_1.0.3_x86_64.deb
    sudo dpkg -i vagrant_1.0.3_x86_64.deb


Creating the VM
---------------
The vagrant instance to use is the one defined in
`dev/vagrant/frontend_precise64`. There should be a prebuilt version at the
following location:

    http://devscreen.gudev.gnl/vagrants/frontend_precise64.box

If this is unreachable, you will need to build the package from scratch and
update the `config.vm.box_url` property of the `Vagrantfile` at the top level.

    cd dev/vagrant
    vagrant up
    vagrant package --output frontend_precise64.box

Start the VM defined in `Vagrantfile` at the top of the source tree:

    vagrant up

And ssh onto it:

    vagrant ssh

As a temporary measure until API key distribution is organised, you will need to
copy the necessary properties file to `/etc/gu/` on the VM. Developers should
be able to copy the necessary `frontend-*.properties` from their dev box
proper to the source root and then onto `/etc/gu` in the virtual instance.

Do not check in `frontend-*.properties`.

SSH onto the virtual instance, copy `frontend-*.properties` and start
the app:

    > cp /etc/gu/frontend-*.properties .
    > vagrant ssh
    ...

    $ cd /vagrant
    $ sudo cp frontend-*.properties /etc/gu
    $ ./sbt011 run

The instance forwards port 80 on the virtual box to port 8000 on the developer
box proper so the application should be available at:

    http://localhost:8000

Since Play recompiles on refresh, you should be able to pretty much ignore the
instance from this point.


Vagrant Commmands
-----------------

* `vagrant suspend`: Disable the virtual instance. The
  allocated disc space for the instance is retained but the instance will not be
  available. The running state at suspend time is saved for resumption.
* `vagrant resume`: Wake up a previously suspended virtual
  instance.
* `vagrant halt`: Turn off the virtual instance. Calling
  `vagrant up` after this is the equivalent of a reboot.
* `vagrant up --no-provision`: Bring up the virtual instance
  without doing the provisioning step. Useful if the provisioning step is
  destructive.
* `vagrant destroy`: Hose your virtual instance, reclaiming the
  allocated disc space.
* `vagrant provision`: Rerun puppet or chef provisioning on the
  virtual instance.


Vagrant SSH X Forwarding
------------------------
X applications on VMs can be displayed on the host machine by specifying a
Vagrant SSH connection with X11 forwarding in the `Vagrantfile`:

    config.ssh.forward_x11 = true

On the host machine, add an `xhost` for the Vagrant VM:

    xhost +10.0.0.2

Then X applications started from the VM should display on the host machine.


Vagrant Troubleshooting
-----------------------
To see more verbose output on any vagrant command, add a VAGRANT_LOG environment
variable setting, e.g.:

    VAGRANT_LOG=INFO vagrant up

Further help troubleshooting can be obtained by editing your `Vagrantfile` and
enabling the `config.vm.boot_mode = :gui` setting. This will pop up a VirtualBox
GUI window on boot.

There have been some issues getting 64bit instances to start. The error is
apparent in GUI boot:

    VT-x/AMD-V hardware acceleration has been enabled, but is not
    operational. Your 64-bit guest will fail to detect a 64-bit CPU and
    will not be able to boot.

Some BIOS setting changes can help. The changes are described at
`http://dba-star.blogspot.com/2011/11/how-to-enable-vtx-and-vtd-on-hp-compaq.html`
but briefly:

1. Restart your developer box.
2. Press F10 for BIOS settings at the boot splash.
3. Edit Security -> System Security (I wasn't expecting it here either!)
4. Enable VT-x and VT-d settings.
5. Save and exit.


[vagrant]: http://vagrantup.com
[virtualbox-download]: https://www.virtualbox.org/wiki/Linux_Downloads

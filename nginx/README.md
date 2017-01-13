# Frontend Nginx Dev Config

## Install Nginx

__Mac:__ [Install Homebrew:](http://brew.sh/#install)

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

__Nginx:__

    # Mac
    brew install nginx

    # Linux
    sudo apt-get install nginx

## Configure Nginx with SSL

1. Make sure you are in `frontend/nginx` directory
1. Ensure you have the correct [hosts](hosts) included in `/etc/hosts` file on your machine
1. Run `sudo ./setup.sh frontend`
1. To setup Dotcom Identity Fronted follow [identity-platform README](https://github.com/guardian/identity-platform)

Make sure ```sites-enabled``` folder is included in your ```nginx.conf``` (usually in ```/usr/local/etc/nginx/nginx.conf```):

    # ...
    http {
        include       mime.types;
        default_type  application/octet-stream;
        # THIS IS WHAT YOU MUST ADD
        include sites-enabled/*;
    #...

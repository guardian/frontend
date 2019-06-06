# Frontend Nginx Dev Config

## Install dependencies

__Mac:__ [Install Homebrew:](http://brew.sh/#install)

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

    brew bundle

__Other operating systems:__
You need to install:
- nginx
- [mkcert](https://github.com/FiloSottile/mkcert)


## Configure Nginx with SSL

1. Ensure you have the correct [hosts](hosts) included in `/etc/hosts` file on your machine
1. Run `sudo nginx/setup.sh`
1. To setup Dotcom Identity Fronted follow [identity-platform README](https://github.com/guardian/identity-platform)


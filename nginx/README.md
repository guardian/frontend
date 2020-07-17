# Frontend Nginx Dev Config

## Install dependencies

### Mac

[Install Homebrew](http://brew.sh/#install).

```
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

$ brew bundle
```

### Other operating systems

You need to install:

- [nginx](https://www.nginx.com/)
- [dev-nginx](https://github.com/guardian/dev-nginx)

## Configure Nginx with SSL

1. Run `nginx/setup.sh`
1. To setup Dotcom Identity Frontend follow the [identity-platform README](https://github.com/guardian/identity-platform)

## Access the Site

Visit https://m.thegulocal.com/.

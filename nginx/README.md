# Frontend Nginx Dev Config

## Install dependencies

### Mac (via Homebrew)

First [install Homebrew](http://brew.sh/#install).

Then:

```
$ cd nginx
$ brew bundle # install deps from the Brewfile
```

### Other operating systems

You need to install:

- [nginx](https://www.nginx.com/)
- [dev-nginx](https://github.com/guardian/dev-nginx)

## Configure Nginx with SSL

1. Run `nginx/setup.sh`
1. To setup Identity follow the [Identity README](../identity/README.md)

## Access the Site

Visit https://m.thegulocal.com/.

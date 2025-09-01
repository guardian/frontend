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

-   [nginx](https://www.nginx.com/)
-   [dev-nginx](https://github.com/guardian/dev-nginx)

## Configure Nginx with SSL

```
$ cd nginx
$ ./setup.sh
```

### Identity

To setup Identity follow the [Identity README](../identity/README.md)

## Access the Site

Visit https://m.thegulocal.com/.

## Testing signed in behaviour

1. Sign in to https://profile.code.dev-theguardian.com/ on a separate tab/window

    - Third party cookies must be enabled in your browser for this to work

2. Back on `frontend` under https://m.thegulocal.com set a cookie with the name `GU_U` with any value on the `m.thegulocal.com` domain and refresh the page
3. You should now be signed in!

    - You should see the header change to show `My Account` instead of `Sign in`
    - In local storage you should see a key `gu.access_token` and `gu.id_token` with the values of the tokens you are signed in with

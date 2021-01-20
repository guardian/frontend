# Identity

This sub-project handles the Guardian profile functionality.

## Running Identity locally

Identity runs securely on a separate subdomain. As such it isn't part of the
dev-build application. The project should be run alongside dev-build if
required.

The [`nginx` README] contains instructions for getting nginx setup. Make sure
you follow those instructions first.

Now to run the identity app:

```
$ ./sbt
project identity
run
```

By default the app will listen on port 9009 (it doesn't run on the default
port, 9000 because that would clash with the rest of the application)

[`nginx` README]: ../nginx/README.md

## Running Identity Frontend locally

In order to have a fully functioning dev environment with working login etc
you'll need to also run the [Identity Frontend] project locally.

First follow the [nginx instructions] in the [identity-platform repo].

Now follow the instructions for [running identity-frontend locally].

[Identity Frontend]: https://github.com/guardian/identity-frontend
[nginx instructions]: https://github.com/guardian/identity-platform/tree/master/nginx
[identity-platform repo]: https://github.com/guardian/identity-platform
[running identity-frontend locally]: https://github.com/guardian/identity-frontend#running

With both these in place, you'll be able to browse Identity on
https://profile.thegulocal.com/ and login on https://m.thegulocal.com.

## Configuration of local Identity API

By default local Identity will use the CODE Identity API.

The Identity site can be configured to use the local Identity API with the
following properties in `~/.gu/frontend.conf`.

```
devOverrides {
  # ID
  id.apiRoot="https://idapi.thegulocal.com"
  id.apiClientToken=frontend-dev-client-token
}
```

You can configure [identity-frontend in the same way].

[identity-frontend in the same way]: https://github.com/guardian/identity-frontend#running-against-dev-identity-api

### Proxying local Identity API requests to CODE

You can also use `idapi-code-proxy.thegulocal.com` locally to proxy requests to
CODE. This is necessary if you want requests to CODE identity API to work from
the browser (running on the same domain as `m.thegulocal.com` means Cookies
will be sent correctly).

# Guardian Open Journalism: Discussion

Discussion is currently running under the generic [dev-build project](https://github.com/guardian/frontend#running).

To have the have it up and running however, you will need a few things setup for ease of use.

## Nginx
You will need to be running your stack on [Nginx](http://wiki.nginx.org/Main).
[See our documentation for more information](https://github.com/guardian/frontend/blob/main/nginx/README.md).

If you are unsure if you are or aren't, just make sure you are viewing the site from [http://m.thegulocal.com].

Add the following properties to your local properties file:

    # Generic
    guardian.page.host=http://m.thegulocal.com
    ajax.url=//m.thegulocal.com

## APIs
### Discussion API
In `DEV` we point to the `CODE` API so as not to create content on `PROD` that would bore our readers.

### Identity API
As the user IDs are shared between the Identity API and the Discussion API, we would need to make sure that we are using
Identity's `CODE` API.

Use the following properties:

    id.apiRoot=https://idapi.code.dev-theguardian.com
    id.apiClientToken=frontend-code-client-token

### Content API
If you'd like to test things such as opening an article for comments, creating a new article with comments etc, you might
want to change the content api host to the code environment:

    content.api.host=(/¯◡ ‿ ◡)/¯ ~ ┻━┻

If you are just looking for an article that is open to comments, you can visit `/science/grrlscientist/2012/aug/07/3` as
it is open on `CODE` and `PROD`.

## Cookies

Unfortunately, this is the weak link in the chain.

To login, go through the normal login process. You will then be directed to the `CODE` environment for the Desktop site.
You will need to copy the `GU_U` cookie with something like
[this chrome extension](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg?hl=en)
[or this firefox extension](https://addons.mozilla.org/en-US/firefox/addon/edit-cookies/).

Then create the same cookie on your `.thegulocal.com` domain.

We should hopefully have a fix for this soon.

Happy yapping.

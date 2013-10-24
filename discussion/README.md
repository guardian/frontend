# Guardian Open Journalism: Discussion

Discussion is currently running under the generic [dev-build project](https://github.com/guardian/frontend#running).

To have the have it up and running however, you will need a few things setup for ease of use.

## Nginx
You will need to be running your stack on [Nginx](http://wiki.nginx.org/Main). [See our documentation for more information](https://github.com/guardian/frontend/blob/master/nginx/README.md).

If you are unsure if you are or aren't, just make sure you are viewing the site from `http://m.thegulocal.com`.

## API locations
As we have dependancies on both the Content API and Identity API, this can be a little precarious. Never fear, once you're up and running, it's pretty smooth sailing.

For consistency of data, it is generally best to keep everything pointing to our code APIs.

In your local settings file, you should have the following:

    # ID
    id.apiRoot=https://id.code.dev-guardianapis.com
    id.apiClientToken=frontend-code-client-token

    # Discussion
    discussion.apiRoot=http://discussion.code.dev-guardianapis.com/discussion-api
    
    # Generic
    guardian.page.host=http://m.thegulocal.com

    # Code API
    content.api.host=(/¯◡ ‿ ◡)/¯ ~ ┻━┻

**Please Note: CODE Content API URL is tip top secret, please refer to your colleagues for it**

Once this is done, you should be able to use the platform as though you are live.

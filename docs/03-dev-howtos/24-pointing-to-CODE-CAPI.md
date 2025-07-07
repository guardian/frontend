# Pointing to CODE CAPI

It can be useful when running frontend locally to point it to CODE CAPI. The easiest way to do this is probably to point it to the CODE deployment of [concierge](https://github.com/guardian/content-api/tree/main/concierge). (In PROD and CODE, frontend connects to CAPI through dedicated URLs that allow it to bypass [kong](https://github.com/guardian/content-api/blob/main/gateways/vigile/README.md), but those URLs are relatively locked down and hard to access from dev computers. Concierge requests go through Kong and so are accessible from the public internet but restricted using API keys.)

To do this, follow the instructions in [14-override-default-configuration](./14-override-default-configuration.md), setting `content.api.host` to the url for concierge-CODE (currently `https://content.code.dev-guardianapis.com`), and `content.api.key` to a valid internal-tier key for concierge-CODE.

If you have access to [bonobo-CODE](https://bonobo-code.capi.gutools.co.uk/), you can create yourself a key there (Set the tier to Internal). If not, send Content Pipeline a message and they can create a key for you.

To give a complete example, here’s a redacted version of my `~/.gu/frontend.conf` from the last time I did this:

```conf
devOverrides {
  content.api.host="https://content.code.dev-guardianapis.com"
  content.api.key="REDACTED"
}
```

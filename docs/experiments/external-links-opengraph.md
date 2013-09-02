# CardController Whitelist

Our opengraph scraper has a whitelist of domains we can extract opengraph content from.

## New York Times

- too many redirects

/cards/opengraph/http%3A%2F%2Fwww.nytimes.com%2F2013%2F08%2F01%2Ffashion%2Fmini-me-with-high-heels-of-her-own.html%3Fpartner%3Drss%26emc%3Drss%26smid%3Dtw-nytimes%26_r%3D3%26

`[MaxRedirectException: Maximum redirect reached: 5]`


## BBC

- OK
- No `description` on desktop news
- Hitting m. redirects scraper to www.

/cards/opengraph/http%3A%2F%2Fm.bbc.co.uk%2Fnews%2Fworld-middle-east-23777201

## Wikipedia

OK

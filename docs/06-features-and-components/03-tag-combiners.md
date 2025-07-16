# Tag combiners

At the Guardian, we have three sorts of index pages.

1. Front pages - curated by editorial staff using the [fronts tool](https://github.com/guardian/facia-tool).
    - eg. <https://www.theguardian.com/uk>
2. Tag pages - automatically generated to contain the most recent content with the given tag.
    - eg. <https://www.theguardian.com/tone/reviews>
    - If a tag shares a URL with a curated front, its tag page can always be accessed by adding a `/all` to the end.
    - eg. <https://www.theguardian.com/film/all>
3. Tag combiner pages - a special sort of tag page, that finds all content that has both of two tags. Simply add a `+` between the two tag paths.
    - Sounds sort of niche, but it is useful - there are tags for film content, and for reviews, but there is no single tag for _film reviews_, but it would be handy to have a link to such a tag page for people who are looking for the latest reviews, and might want to skip the rest of our film-related content.
    - eg. <https://www.theguardian.com/film+tone/reviews>
    - There's some more ideas of what you can use these for in this blog post which accompanied the initial development: <https://www.theguardian.com/help/insideguardian/2008/apr/11/lateeastereggs>

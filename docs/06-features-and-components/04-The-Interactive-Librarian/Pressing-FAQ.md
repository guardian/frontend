## Pressing - FAQ

### What is pressing?
Pressing is the process of taking a snapshot (a copy of the html) of a page, store it in S3 and serve this copy to the readers.

### What happens when we press an article?
We carry out the following process:
- Capture the html of the page as it has been rendered via frontend. This includes any inlined javascript (e.g. the main gu js bundle), styles, or external links (e.g. navigation links, external js bundles such as those used for tracking).
- Store the article html in `aws-frontend-archive-originals` S3 bucket.
- Run a secondary process to ‘clean’ the content. The result is a second copy of the document that will be served to readers. This gets stored in `aws-frontend-archive` S3 bucket.

Cleaning has 2 steps:
- Removing content that will likely break over time such as ads and reader revenue callouts.
- Appending additional copy to the end of the article to provide an indication to the reader that they are viewing archived content and that some elements might be out of date.

### How to press a page?
1. Head to [https://frontend.gutools.co.uk/press/content](https://frontend.gutools.co.uk/press/content) and follow the steps to press.
2. To serve a pressed page, there's currently a manual list kept in the Frontend repo, so you'll want to raise a PR updating the [PressedContent.scala](https://github.com/guardian/frontend/blob/main/common/app/services/dotcomrendering/PressedContent.scala) - You should add the path of the pressed page ([example PR](https://github.com/guardian/frontend/pull/24422)).
Completing this means that the article will now be served by its pressed version (created in step 1), rather than rendered with DCR.

### How to un-press a page?
"Un-pressing" is really just "No longer serving a pressed page", so the only step is to raise a PR changing [PressedContent.scala](https://github.com/guardian/frontend/blob/main/common/app/services/dotcomrendering/PressedContent.scala) removing the path of the pressed page we no longer want to serve.
Completing this means we will return to rendering DCR versions of the article, rather than the pressed file.

### How to update a pressed page?
+++

### What types of content can I press?
Currently, articles and interactive pages.

### How can I see an example of a pressed page?
Go to [PressedContent.scala](https://github.com/guardian/frontend/blob/main/common/app/services/dotcomrendering/PressedContent.scala) and access any of the articles in the list.

### I’ve pressed a page. Can I still see how it looks on frontend or DCR?
Yes. To render the page from frontend add `dcr=false` at the end of the path, to render it via DCR add `dcr=true`.


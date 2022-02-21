## Interactive Pressing

### Objective
One of dotcom’s objectives is to migrate 100% of articles to DCR. There are a number of benefits to using dotcom-rendering as the primary rendering platform (including flexibility, speed in changing or adding new layouts, etc).

An additional benefit of migrating interactives is that, after the migration is complete, we could 'clean-up' some of our code. Ideally we wouldn't want to maintain code that renders interactives in 2 places (dotcom-rendering (DCR) and the existing platform, frontend).

### Background
In our mission to migrate 100% of articles to DCR we investigated how to migrate interactive articles. Interactive articles are defined as articles of `type/interactive`. Typically interactive articles have `ng-interactive` in the path too.

Migrating interactives to render via DCR proved tricky.
- There were a number of non-trivial UI bugs per article, with each bug taking ~1day to resolve. Our designer helped us to review the bugs to ensure we were migrating articles to (at least) an acceptable standard.
- Some non-trivial bugs resulted in the page not loading or unacceptable UI bugs. We were able to quickly identify these bugs using a screenshot comparison tool. For other non-trivial bugs, we could only identify these by loading the article on a browser and comparing side-by-side with the original version. Per article, this manual process took much longer to identify bugs.
- We tried to look for commonality between issues with the hope that a single fix would resolve the issue across multiple articles. We quickly discovered that the resolution for one bug often did not resolve the same bug in another article. We believe this is a result of subtle differences in the way that interactives have been created.
- We applied all fixes to the rendering platform. Towards the end of our 6-week period of interactive migration we started to reach a point where platform-side fixes for certain interactives regressed the UI of others. This led us to believe that we should prefer fixing the interactive instead of the rendering platform.

Querying the content API by `type/interactive`, excluding certain interactive tones that were successfully migrated and only including articles published before the switchover date (23rd June 2021) we can see there are 2385 articles. NB: the tones that we’ve successfully migrated are `tone/documentaries`, `tone/cartoons`, `profile/david-squires`, `education/universityguide`, `tone/resource`.

It was felt that migrating all interactives onto DCR would lead to diminishing returns. In a conversation with the Visuals team (the owners of the interactive articles), it was agreed that some interactive articles would be migrated and some would be pressed.

### Migration Process
Below describes the migration process:
- For articles greater than 5 years old, we will press everything by default.
- For articles less than 5 years old, The Visuals team will provide a list of interactives that will not be pressed, everything else will be pressed.

If issues are found with a migrated interactive then we have the option to fix in one of three different ways:
1. Pressing the piece
2. Visuals team fixing the piece
3. Dotcom adding support to the platform

If there are issues that are common between pieces we could potentially add support in the platform (just to note that in the past we did spend a lot of time on this, but there weren't many opportunities that we could find to fix multiple issues at once).

### What is pressing
Pressing is the process of capturing and archiving how articles currently appear. The result is that when a customer views the article they see the archived content, not ‘live’ content rendered via DCR or frontend.

When we press an interactive article we carry out the following process:
- Capture the html of the page as it has been rendered via the existing platform (frontend). This includes any inlined javascript (e.g. the main gu js bundle), styles, or external links (e.g. navigation links, external js bundles such as those used for tracking).
- Store the article html in a remote store (S3).
- Run a secondary process to ‘clean’ the content. The result is a second copy of the document that will be served to readers. Cleaning has 2 steps:
- Removing content that will likely break over time such as ads and reader revenue callouts.
- Appending additional copy to the end of the article to provide an indication to the reader that they are viewing archived content and that some elements might be out of date.

The result of pressing is both the ‘original’ copy of the interactive as well the ‘cleaned’ version that we serve to readers. This mitigates some risk: if we ever want to change or update the cleaning process we can do so without needing the old code in the frontend codebase to exist.

### Extra Information

**How do we press?**

We have 2 options, we can press a batch of interactives using scripts or we can press a single interactive using the frontend admin tool.

For pressing a batch of interactives this is controlled using command line scripts. An example of these scripts is included in the frontend docs. The batch pressing process is separated into a couple of independent steps:
1. Querying the content API, or via some other means, to determine the list of interactive URLs to press
2. For every URL make a request to /interactive-librarian/live-presser/{path}
3. For every successfully pressed article make a request to /interactive-librarian/read-clean-write/{path}

To press a single interactive we can use the frontend admin tool. On the admin tool, select the new option ‘Press an article / interactive’, enter the full URL, click ‘Press’ and wait for the response. If there’s an error in the response it’ll need to be reported to the dotcom team.

**How do we know a page is pressed?**

Each pressed article will have additional copy appended to the document. At the very bottom of the page we should see the copy ‘This article was archived on <date>. Some elements may be out of date.’

**How do we decide to serve pressed content to readers?**

We have an intermediate solution for determining if a page is pressed: we retain a list of article URLs in config. Only if the article being requested is included in this list do we serve the pressed content.

In the long term we’d like to mark pressed articles with a tracking tag (tracking/dcroptout). Articles with this tag will be served as pressed versions. We can’t adopt this solution until Ed Tools have completed a spike to understand how we can achieve this.

**How can we view a pressed page?**
To view a pressed page there are a couple of options:
- Get the document from S3 directly (aws-frontend-archive).
- Intermediate solution: add the interactive path to the frontend config (https://github.com/guardian/frontend/blob/dlawes/serve-pressed-interactives/common/app/services/dotcomrendering/PressedInteractives.scala#L11).
- Long-term solution: add tag tracking/dcroptout to article.

**Can we opt-out of pressing and render via frontend or DCR?**

Yes! In the short term, if we want to opt-out of serving pressed content then we omit or remove the interactive path in the relevant frontend config. In the long term, if we want to opt-out of serving the pressed content we will remove, or we will not apply, the chosen tracking tag (tracking/dcroptout).

Note that, after some agreed period of time, the plan is to remove the rendering code from the frontend codebase, after which point articles could only be rendered via DCR.

**What about interactives via AMP?**

Interactives have to opt-in to rendering via AMP using a specific tag. Interactives rendering via AMP are out of scope for this migration.

**What about interactives on Apps?**

Rendering interactives on Apps is a separate flow. Given we’re not changing the article content then legacy interactives for mobile will be unaffected. We need to be aware that if there is a request to update the content of a legacy interactive this would need to be done via Composer for the mobile version (so the CAPI response is updated), as well as updating the pressed version for web.

**If we’ve pressed an article, how do we unpress?**

Unlike r2 articles, legacy interactive article content will be retained within the content API.
To unpress interactives so we can render via DCR we can remove the interactive URL from frontend config (or remove the tracking tag). Rendering via DCR would probably introduce bugs that would need to be reviewed and fixed.
If we want to un-press so we can make a small copy change (for e.g. legal reasons), but then continue to show the pressed version, we could make the change in composer (to ensure the content is as-expected and that the article renders correctly in apps) and replicate this change to the html document stored in s3.
Notes:
- Our intermediate solution for serving pressed interactives requires modifying a list of interactive paths held in the frontend codebase. So, for now, there is no programmatic way to suppress a pressed article from being served to users. The frontend admin tool will be updated to indicate that anyone wanting to un-press an interactive should contact dotcom.
- In the long-term, when we are able to use tracking tags to indicate that a pressed article should be served, we could update the admin tool to programmatically remove tags, as needed.

**If we’ve migrated to DCR but then want to revert to its pre-DCR form, how do we achieve this?**

After the migration is complete (and a further agreed period of time, say 6 months), we would consider removing the code that renders interactives from the existing platform. In this scenario, un-pressed interactives could only be rendered via DCR.

A potential solution for reverting a migrated interactive to its pre-DCR form:
- We agree that the pressing process is satisfactory and we press (and serve) an initial batch of pressed interactives to readers.
- At this point,we also press every interactive (but not serve all this content to readers). Pressing the content would mean we save how the interactive renders via the existing platform.
- If an article is migrated to DCR but we're unhappy with how it appears, we could fall back to serving the pressed version.


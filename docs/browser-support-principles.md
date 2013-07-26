# Browser Support Principles
##_We believe that our journalism should be accessible to everyone [theguardian.com](http://www.theguardian.com/?view=mobile) uses [responsive design](http://alistapart.com/article/responsive-web-design) to help us achieve this._
This means each feature of the website needs to consider how it adapts itself to each user's environment. Practically speaking this means thinking a handful of environmental factors when designing and building the frontend, for example. ...

### Responsive Design
One responsive site for all viewports and browsers. This means
responding intelligently based on device capabilities, rather than a
single pixel-perfect design. We use media queries to vary CSS at
different breakpoints
### Cutting the mustard
We only serve Javascript to browsers that [Cut
The Mustard](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard). For browsers that fail that test, we still expect the
core content to render, but they will not get enhancements such as Web
Fonts. This frees us up to not write Javascript for and test
extensively in older browsers. This leads nicely on to...
### Progressive Enhancement
Start with a static template that we can serve without Javascript,
then progressively enhance with a lazy-loaded version we can AJAX in.
This ensures a graceful experience when viewing with a less capable
device, or simply when for whatever reason the Javascript fails we can
turn our [escalator into stairs](http://jakearchibald.com/2013/progressive-enhancement-still-important).
#### Examples
Examples of what this means in practice:

* Static link to Most Read page vs AJAX most read tabs

* Static link to full cricket Scorecard vs AJAX mini-scorecard in Live Blogs

* System fonts vs Guardian web fonts

**Basic version as viewed in IE8**

![IE8 demonstrates basic version](/images/ie8_basic.png "basic version as visible in IE8")

**Full version as visible in Chrome**

![Chrome demonstrates full version](/images/chrome_full.png "full JS version as seen in Chrome")

### Browser support table
Based on these principles and usage stats we have produced a <a
href="https://docs.google.com/a/guardian.co.uk/spreadsheet/ccc?key=0At1OrgA9hbE_dG95OElVaWV5T1MyRVlySnM2T3RvS2c#gid=0">browser
support table</a> showing how we only expect the site to fully
function in browsers that 'Cut the mustard', an edge case is IE 8, to
which we will serve a specific style sheet and Javascript to offer
some enhanced functionality whilst it continues to have significant
usage.

We will revise these periodically based on [browser usage stats](https://frontend.gutools.co.uk/analytics/browsers) collected from Ophan.
# Overview

Remote scripts, especially ads, block the page from doing anything else while they load. They contribute a large % to load times which [affects your bottom line](http://devnet.kentico.com/Blogs/Thomas-Robbins/September-2012/How-loading-time-affects-your-bottom-line-Infograp.aspx). *Asynchronous* ads do not block the page and can be delivered after core content - [Async FTW](http://www.krux.com/pro/broadcasts/krux_blog/synchronous_vs_asynchronous_tags_whats_the_big_deal/).

Why is it so hard to deliver ads asynchronously? Because they may contain calls to `document.write`, which expects to be handled synchronously. **PostScribe lets you deliver a synchronous ad asynchronously without modifying the ad code**.

Shameless Plug: Using this standalone library is a great start, but if you want to go further and have your tags centrally managed instead of having them hard-coded on the page, Check out [Krux's SuperTag](http://www.krux.com/pro/whatwedo/manage/supertag/), developed by the same authors as this library.


### Approach

Other tag writing libraries exist (see [alternatives](#alternatives)), but PostScribe is novel in it's use of what we call DOM Proxies, a way to ensure that the content is written as close to the way the browser would natively write the content with `document.write`/`innerHTML`. Read: it behaves just like the browser would, without convoluted parsing or hacks.

For more information:

* [Presentation at HTML5devconf](http://youtu.be/ClzeilKwX10) by the author, Derek Brans
* [Interactive Demo](http://raw.plnkr.co/e8MJAx/) with side by side comparisons of other tag writers
* [Documentation](https://github.com/krux/postscribe/tree/master/doc)
* Browse the [raw](https://github.com/krux/postscribe/blob/master/postscribe.js) or [annotated](http://krux.github.com/postscribe/doc/postscribe.html) source code.


# Getting Started

PostScribe overrides document.write. It is best and safest to use PostScribe after DOM is ready.

Include `./htmlParser/htmlParser.js` and `./postscribe.js` on your page. TODO: cdn for postscribe.min.js

To append html to #mydiv:

    postscribe('#mydiv', '<h1>Hello PostScribe</h1>');

In general:

    postscribe(element, html, options);

* *element:* a DOM Element, jQuery object, or id selector (e.g. "#mydiv")
* *html:* an html string or a function that takes a DOM Document and writes to it.
* *options:* a hash of options
  * *done:* a callback that will be called when writing is finished.


If you just want to mess around, include the js files at the top of an html page that contains the following:

    <div id="mydiv"></div>
    <script type="text/javascript">
      postscribe('#mydiv', '<h1>Hello PostScribe</h1>');
    </script>


## How to use postscribe to render an ad after load

Where normally you would have

    <div id="ad"><h5>Advertisement</h5>
      <script type="text/javascript">
        // Build url params and make the ad call
        document.write('<script src=doubleclick_url_with_params><\/script>');
      </script>
    </div>

Instead, remove the ad call and close the div

    <div id="ad"><h5>Advertisement</h5></div>

    <script type="text/javascript">
      // jQuery used as an example of delaying until load.
      $(function() {
        // Build url params and make the ad call
        postscribe('#ad', '<script src=doubleclick_url_with_params><\/script>');
      });
    </script>

# FAQ
##### Does it work with jQuery, Prototype, Backbone, Underscore, jQuery UI, YUI, mooTools, dojo, etc.?
Yep. It neither depends on nor conflicts with any of the existing popular javascript frameworks.

##### Does it work with another tag writing library on the page?
[Wat?](http://izit.org/sites/izit.org/files/1329697955565.jpg) No. Only one tag writer at a time.


# Who is using it
This project was originally developed at [Krux](http://www.krux.com) as part of its [SuperTag](http://www.krux.com/pro/whatwedo/manage/supertag/) product. There it was battle tested on high-profile sites like [The New York Times](http://www.nytimes.com), [The Wall Street Journal](http://online.wsj.com), [NBCU](http://www.nbcuni.com), and hundreds of others. It is actively maintained by Krux.



# Browser Compatibility
Postscribe was designed to behave as closely to the native `document.write`/`innerHTML` does as possible, and we've taken great care to make sure that it works on every browser we can get our hands on. We expect it to work on every browser built after 2005. There are over 400 [unit tests](https://github.com/krux/postscribe/tree/master/test) that run on every commit, and we add more all the time. Postscribe is thoroughly tested and known to work well in the following browsers:

* Firefox - 3.6 and 4+
* Chrome 10+
* Safari - 5.0+
* Opera - 10.0+
* Internet Explorer 7+ (as far as we know, it will work on IE 6, but we're trying to encourage [its death](http://ie6funeral.com), so we haven't tested it)
* iPhone/iPad and other webkit-based browsers

Curious if a specific browser will work? [Run the tests yourself](http://krux.github.com/postscribe/test/test.html) and let us know if you see any failures.

# Alternatives
We've stood on the shoulders of giants with our work, and there are other alternative approaches to solve this problem. Shout out to the best ones we found:

* [writeCapture](https://github.com/iamnoah/writeCapture)
* [Ghostwriter](http://digital-fulcrum.com/ghostwriter/docs/files/ghostwriter-js.html) by Digital Fulcrum (it looks like they have removed references to it on their site?)
* [ControlJS](http://stevesouders.com/controljs/) by [Steve Souders](http://stevesouders.com)

If you would like your project to be added to this list, file an issue and we'd be happy to.


# Help/Bugs/Requests
Have a problem? Need help? Would you like additional functionality added? We use github's ticket system for keeping track of these requests.
Please check out the [existing issues](https://github.com/krux/postscribe/issues), and if you don't see that your problem is already being
worked on, please [file a new issue](https://github.com/krux/postscribe/issues/new). The more information the better to describe your problem.
We ♥ [Jing](http://www.techsmith.com/jing.html) bug reports.

# Contributing
We ♥  [forks and pull requests](https://help.github.com/articles/using-pull-requests).


## Environment
To run the tests and static code analysis tools, you will need to have the following installed:

* nodejs (>=0.8) & npm - [Install Instructions](https://github.com/joyent/node/wiki/Installation)
* PhantomJS - A headless browser based on Webkit. [Install Instructions](http://phantomjs.org/download.html)
* All other project dependencies are installed via npm with `npm install`
	* [grunt](http://gruntjs.com) - a 'make' like tool for automating build, test, and other dev tasks

## Pull Request Guidelines
Spaces, not tabs. 2 of them. [jQuery's style guide](http://docs.jquery.com/JQuery_Core_Style_Guidelines) covers just about everything else.
Please do not update 3rd-party libraries (qunit, jquery) or the dist directory. We have an internal process for doing this.

## Issue Guidelines
Please include a [jsfiddle](http://jsfiddle.net) or [plunker](http://plnkr.co) that distills and reproduces the issue.
Try forking [this jsfiddle](http://jsfiddle.net/dbrans/Znpxv/). We've set everything up there for you so that you can reproduce your issue.

## Testing
Using [travis-ci](https://travis-ci.org) and [grunt](http://gruntjs.com), the [Qunit](http://qunitjs.com) unit tests are run on every commit using PhantomJS to run the tests with a real browser.

Current Build Status: [![Build Status](https://secure.travis-ci.org/krux/postscribe.png)](http://travis-ci.org/krux/postscribe)

To run the tests:

`$ grunt test`

We use jshint to do static analysis of the javascript and keep things smelling good. To run jslint:

`$ grunt lint`

**Pro Tip**: You can use TDD and have jslint and the tests run on every commit with:

`$ grunt watch`


# History
Postscribe uses [software versioning standards](http://semver.org) as follows: major.new.maintenance[.trivial]. There are git tags for each release if you would like to see older versions.

##### 1.1.2
* iframe and textarea fix

##### 1.1.1
* Error handling mod

##### 1.1.0
* major refactoring to simplify code and fix rare bugs related to script tag handling
* scripts are now written inline

##### 1.0.5
* htmlParser performance fix

##### 1.0.3
* Test framework improvements
* Bug fixes

##### 1.0.2
* Documentation release

##### 1.0.1
* Documentation release

### 1.0.0 Initial open source release
[Released on Oct 12 2012](https://github.com/krux/postscribe/tree/version/1.0)

* Write tags asynchronously, yo. Initial release after 2+ years of development internally at [Krux](http://www.krux.com)

# License
We aim for you to use this inside your application, so we picked the least restrictive license we could find. MIT License - see [LICENSE](https://github.com/krux/postscribe/blob/master/LICENSE)




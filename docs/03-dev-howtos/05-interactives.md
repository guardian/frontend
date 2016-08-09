# Interactives

This document explains how to create interactive content on theguardian.com.

An interactive comprises of a stand-alone javascript application wrapped in an AMD interface compatible with the next-gen project.

The interactive AMD module must return a function called `boot`.

What the interactive modules does after this is largely up to whoever is writing it.

This module can be uploaded in to s3 along with the rest of the interactive application and associated assets.

Here is a simple boilerplate using this pattern.

```
define(['your/dependencies'], function (dependency) {
    return {

        /**
         *
         * @param el        : The Element of the interactive that is being progressively enhanced. 
         * @param context   : The DOM context this module must work within.
         * @param config    : The configuration object for this page. 
         *
        **/

        // 'boot' is a standard interface for our application to start the interactive
        boot: function (el, context, config) {

                // do something to bootstrap the interactive

            }
        }
    });
```

## Embedding the interactive in a page

Embedding the interactive in a page is the same as today. A page is created in r2, a URL is assigned, and an editor can publish it, at which point it will appear in the Content API.

When the page is delivered to the user the frontend code scans the DOM for interactives and loads each one.

Currently any URL with the `ng-interactive` will be routed to the interactive server.

## Examples

- [Media 100](http://www.theguardian.com/media/ng-interactive/2013/sep/02/media-100-2013-full-list?view=mobile)
- [Matthew Herbert music quiz](http://www.theguardian.com/music/interactive/2013/aug/20/matthew-herbert-quiz-hearing?view=mobile)
- [Australia Election 2013](http://www.theguardian.com/world/australia-election-2013-interactive?view=mobile)

Note how, in each of these examples, there is a &lt;figure> element in the source of the HTML with a `data-interactive` attribute.

Note, also how, in your web inspector network panel, the boot.js file is loaded, and subsequently loads the interactive application. 

## Notes

- Frontend currently use [curl.js](https://github.com/cujojs/curl) to load AMD modules.
- Interactives can be hosted on s3://gdn-cdn, which is mapped to [interactive.guim.co.uk](http://interactive.guim.co.uk).
- s3 [supports CORS](http://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html).

## Previewing interactives on a localhost

The simplest way of previewing the interactive content on non-production environments is to run the `applications` server locallly.

Follow instructions on the project [README](https://github.com/guardian/frontend/tree/master/README.md).

## Composer 

Composer is used to write (i) a basic accessible description of the interactive from within an article, (ii) define the URL to an
interactive application associated with that block.

For example, such a block might look like this as it comes out of Content API:-

```
<body>
    <h1>Headline</h1>
    <p>
        Article paragraph that has been written in Composer.
    </p>

    <!-- An accessible description of the interactive -->
    <figure class="interactive" data-interactive="http://path/to/interactive/boot.js">
        ...
        <caption>
            This is a chart describing the most polluted roads in London. 
        </caption>
    </figure>
    ...
</body>
```

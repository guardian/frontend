Interactive
-----------

This covers interactive content written and commisioned by Guardian development teams.

## Embeded and standalone interactives 

The proposal is that Composer is used to write a (i) basic accessible description of the interactive from within an article, (ii) define the URL to
an interactive application associated with that block.

For example, such a block might look like this :-

```
<body>
    <h1>Headline</h1>
    <p>
        Article paragraph that has been written in Composer.
    </p>
   
    <!-- An accessible description of the interactive -->

    <figure class="interactive" data-interactive="http://path/to/interactive/boot.js">
        <table>
            <tr>
                <td>North Circular</td>
                <td>346</td>
                <td>12%</td>
            </tr>
            ...
        </table>
        <caption>
            This is a chart describing the most polluted roads in London. 
        </caption>
    </figure>
    ...
</body>
```

During the bootstrapping of the frontend code we scan the DOM for interactives and `require()` each one. 

The interface between frontend & interactives should therefore follow this sort of pattern,

```
define(['your/dependencies'], function () {
    return {

        /**
         *
         * @param el        : The Element of the interactive that is being progressively enhanced. 
         * @param context   : The DOM context this module must work within.
         * @param config    : The configration object for this page. 
         * @param mediator  : The event system (publish/subscribe) for this page.
         *
        **/

        // 'boot' is a standard interface for our application to start the interactive
        boot: function (el, context, config, mediator) {

                // do something to bootstrap the interactive

            }
        }
    });
```

This module can be uploaded in to s3.

What the interactive modules does after this is largely up to whoever is writing it.

Your `boot` function may simply include an iframe, Eg.

```
boot: function (el, context, config, mediator) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute("src", "http://gia.guim.co.uk/2012/05/gay-rights/interactive/flat.html");
    el.appendChild(iframe);
}
```

This means we :-

 - Deprecate the use of a distinct 'interactive' page type (it is just a module in an article).
 - Deprecate the use of code objects.
 - Move to all interactives being loaded as AMD modules.

## Other types of interactives

There are other types of work that are classified as 'interactive' - galleries, elections coverage, assorted page enhancements.

I feel this work is best taken on a case by case basis rather than us designing a general system.

For example, a 3 month election campaign we should hive off some URL space and write a dedicated application for the purpose. 

Or, for things like the NSA rollovers component, are better deployed as part of our main frontend application under an AB test.

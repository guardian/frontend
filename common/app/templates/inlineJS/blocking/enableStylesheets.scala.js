@()(implicit request: RequestHeader)

/* Based on loadCSS. [c]2017 Filament Group, Inc. MIT License */
(function(w) {
    var exposeLoadedState = function() {
        // Set flag for when the CSS loads before the JS
        w.guardian.css.loaded = true;

        // Execute callback for when the JS loads before the CSS
        try {
            w.guardian.css.onLoad()
        } catch (e) {};
    };

    var loadCSS = function(href, before, media) {
        // Arguments explained:
        // `href` [REQUIRED] is the URL for your CSS file.
        // `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
        // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
        // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
        var doc = w.document;
        var ss = doc.createElement( 'link' );
        var ref;

        if (before) {
            ref = before;
        } else {
            var refs = (doc.body || doc.getElementsByTagName('head')[ 0 ]).childNodes;
            ref = refs[refs.length - 1];
        }

        var sheets = doc.styleSheets;
        ss.rel = 'stylesheet';
        ss.href = href;
        // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
        ss.media = 'only x';

        // wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
        function ready(cb) {
            if (doc.body) {
                return cb();
            }

            setTimeout(function() {
                ready(cb);
            });
        }

        // Inject link
        // Note: the ternary preserves the existing behavior of 'before' argument, but we could choose to change the argument to 'after' in a later release and standardize on ref.nextSibling for all refs
        // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
        ready(function() {
            ref.parentNode.insertBefore(ss, (before ? ref : ref.nextSibling));
        });

        // A method (exposed on return object for external use) that mimics onload by polling document.styleSheets until it includes the new sheet.
        var onloadcssdefined = function(cb) {
            var resolvedHref = ss.href;
            var i = sheets.length;
            while (i--) {
                if (sheets[ i ].href === resolvedHref){
                    return cb();
                }
            }

            setTimeout(function() {
                onloadcssdefined( cb );
            });
        };

        function loadCB() {
            if (ss.addEventListener) {
                ss.removeEventListener('load', loadCB);
            }

            ss.media = media || 'all';
            exposeLoadedState();
        }

        // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
        if (ss.addEventListener) {
            ss.addEventListener('load', loadCB);
        }

        ss.onloadcssdefined = onloadcssdefined;
        onloadcssdefined(loadCB);

        return ss;
    };

    var initialize = function() {
        var isPreloadSpported = function() {
          try {
            return document.createElement('link').relList.supports('preload');
          } catch (e) {
            return false;
          }
        };

        // loop preload links and fetch using loadCSS
        var preloadPolyfill = function() {
          var links = document.getElementsByTagName('link');
          for (var i = 0; i < links.length; i++) {
              var link = links[i];
              if(link.rel === 'preload' && link.getAttribute('as') === 'style') {
                  loadCSS(link.href, link, link.getAttribute('media'));
                  link.rel = null;
              }
          }
        };

        /* if preload is supported, just expose the state and quit */
        if (isPreloadSpported()) {
            exposeLoadedState();
            return;
        }

        preloadPolyfill();

        if (w.addEventListener) {
            var run = setInterval(preloadPolyfill, 300);

            w.addEventListener('load', function() {
              preloadPolyfill();
              clearInterval(run);
            });
        }
    };

    initialize();
}(window));

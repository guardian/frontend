define(["reqwest", "bean", "swipe", "common", "modules/detect", "modules/url", "bonzo"], function (reqwest, bean, Swipe, common, detect, url, bonzo) {

    var Gallery = function () {

        var urlParams = url.getUrlVars();

        var view = {

            galleryConfig: {
                nextLink: document.getElementById('js-gallery-next'),
                prevLink: document.getElementById('js-gallery-prev'),
                currentIndex: urlParams.index || 0,
                currentSlideClassName: 'js-current-gallery-slide',
                inSwipeMode: false,
                inFullScreenMode: false,
                gallerySwipe: null
            },

            // runs on domready
            bindGallery: function () {

                if (detect.hasTouchScreen()) { // only enable swiping for touch devices, duh.

                    view.galleryConfig.inSwipeMode = true;

                    // add swipe styling
                    document.getElementById('js-gallery').className += ' gallery-swipe';

                    // when we load, grab the prev/next and show them too
                    var currentSlide = common.$g('.' + view.galleryConfig.currentSlideClassName)[0];

                    var nextSlide = currentSlide.nextElementSibling;
                    var prevSlide = currentSlide.previousElementSibling;
                    var totalSlides = currentSlide.getAttribute('data-total');

                    // preload the slides ahead/behind the current one
                    // (we only do this for swipe, to allow seamless swiping)
                    view.makePlaceholderIntoImage([nextSlide, prevSlide]);

                    // set up the swipe actions
                    view.galleryConfig.gallerySwipe = new Swipe(document.getElementById('js-gallery-holder'), {
                        callback: function(event, index, elm) {
                            var count = document.getElementById('js-gallery-index');
                            var currentPos = parseInt(count.innerText, 10);
                            var nextIndex = parseInt(index, 10);
                            var nextIndexCount = nextIndex + 1;
                            
                            // track the swipe and its direction
                            if (nextIndexCount > currentPos) {
                                view.trackInteraction("swipe:forward");
                                view.advanceGallery('next');
                            } else if (nextIndexCount < currentPos) {
                                view.trackInteraction("swipe:backward");
                                view.advanceGallery('prev');
                            }

                        }
                    });

                    // check if we need to jump to a specific gallery slide
                    if (urlParams.index) {
                        view.galleryConfig.gallerySwipe.slide(parseInt(urlParams.index, 10)-1, 0);
                    }

                    // bind prev/next to just trigger swipes
                    bean.add(view.galleryConfig.nextLink, 'click', function(e) {
                        // we get 2 omniture calls here and in the function below
                        // one is for the link click (which seems to be impossible to remove)
                        // the other is for the faux swipes triggered here
                        view.galleryConfig.gallerySwipe.next();
                        e.preventDefault();
                    });

                    bean.add(view.galleryConfig.prevLink, 'click', function(e) {
                        view.galleryConfig.gallerySwipe.prev();
                        e.preventDefault();
                    });

                } else { // non-touch version

                    bean.add(view.galleryConfig.nextLink, 'click', function(e) {
                        view.advanceGallery('next');
                        e.preventDefault();
                    });

                    bean.add(view.galleryConfig.prevLink, 'click', function(e) {
                        view.advanceGallery('prev');
                        e.preventDefault();
                    });

                    // bind arrow key navigation
                    bean.add(document, 'keydown', function(e) {
                        var didAdvance = false;
                        if (e.keyCode === 37) { // left
                            didAdvance = view.advanceGallery('prev');
                            if (didAdvance) {
                                // don't track keypresses if they're already at the start
                                view.trackInteraction("keyboard:previous");
                            }
                        } else if (e.keyCode === 39) { // right
                            didAdvance = view.advanceGallery('next');
                            if (didAdvance) {
                                // don't track keypresses if they're already at the end
                                view.trackInteraction("keyboard:next");
                            }
                        }
                    });

                }

                // this means the user used the back/forward buttons
                // so we should change gallery state to match
                window.onpopstate = function(event) {
                    var urlParams = url.getUrlVars(); // fetch again
                    if(urlParams.index) {
                        var matches = urlParams.index.match(/\d+/); // URL params can become like ?index=10#top
                        if (matches) {
                            urlParams.index = matches[0];
                            view.advanceGallery(null, urlParams.index);
                        }
                    }
                };

            },

            // send custom (eg non-link) interactions to omniture
            trackInteraction: function (str) {
                if (str) {
                    common.mediator.emit('module:clickstream:interaction', str);
                }
            },

            advanceGallery: function (direction, customItemIndexToShow) {

                // set up variables
                var currentSlide    = document.getElementsByClassName(view.galleryConfig.currentSlideClassName)[0];
                var currentIndex    = parseInt(currentSlide.getAttribute('data-index'), 10);
                var totalSlides     = parseInt(currentSlide.getAttribute('data-total'), 10);
                var isFirst         = (currentIndex === 1);
                var isLast          = (currentIndex === totalSlides);
                var slideCounter    = document.getElementById('js-gallery-index');
                
                // don't try to do anything if we're at the start/end going forward/back
                if ( (isFirst && direction === "prev") ||
                     (isLast && direction === "next") ) {
                    return false;
                }

                var elmToWorkWith, newSlideIndex;

                // hide the current slide
                currentSlide.className = '';

                // this hides the current slide (we don't need to do this when swiping)
                if (!view.galleryConfig.inSwipeMode) {
                    currentSlide.style.display = 'none';
                }

                if(!customItemIndexToShow) {

                    // choose the element to show
                    elmToWorkWith = (direction === 'next') ? currentSlide.nextElementSibling : currentSlide.previousElementSibling;

                    // update counter
                    newSlideIndex = (direction === 'next') ? (currentIndex + 1) : (currentIndex - 1);
                
                } else {
                    // used for scrolling to a custom item on pageload
                    elmToWorkWith = document.getElementById('js-gallery-item-' + customItemIndexToShow);
                    newSlideIndex = customItemIndexToShow;
                }

                // now we have an element to work with, let's get the ones on either side of it
                var nextSlide = elmToWorkWith.nextElementSibling;
                var prevSlide = elmToWorkWith.previousElementSibling;

                // show and hide next/prev links
                view.handlePrevNextLinks(newSlideIndex, totalSlides);

                // update count of current position
                slideCounter.innerHTML = newSlideIndex;

                // tweak the page URL
                view.updateURL('index=' + newSlideIndex, newSlideIndex);

                // convert the slide to an image if we need to

                var elmsToPreload = [prevSlide, elmToWorkWith, nextSlide];
                view.makePlaceholderIntoImage(elmsToPreload);

                // make this slide active
                elmToWorkWith.className = view.galleryConfig.currentSlideClassName;
                elmToWorkWith.style.display = 'block';

                return true;

            },

            updateURL: function (querystring, index) {
                var args = {
                    'state': {},
                    'title': (window.title || '') + ' (' + index + ')',
                    'querystring': '?' + querystring
                };
                
                common.mediator.emit('modules:url:pushquerystring', args);
            },

            handlePrevNextLinks: function (index, total) {
                var nextLink = view.galleryConfig.nextLink;
                var prevLink = view.galleryConfig.prevLink;

                index = parseInt(index, 10);
                total = parseInt(total, 10);

                if (index === 1) { // we've gone back to the start, hide prev
                    prevLink.style.display = 'none';
                    nextLink.setAttribute('href', '?index=2');
                } else if (index === 2) { // we can now go back, show prev
                    prevLink.style.display = 'inline';
                    prevLink.setAttribute('href', '?index=1');
                    nextLink.setAttribute('href', '?index=3');
                } else if (index === total-1) { // show next again...?
                    nextLink.style.display = 'inline';
                    prevLink.setAttribute('href', '?index=' + (index - 1));
                    nextLink.setAttribute('href', '?index=' + total);
                } else if (index === total) { //we're at the end, hide next
                    nextLink.style.display = 'none';
                    prevLink.setAttribute('href', '?index=' + (total -1));
                } else { // it's in the middle
                    prevLink.setAttribute('href', '?index=' + (index - 1));
                    nextLink.setAttribute('href', '?index=' + (index + 1));
                }
            },

            // used to to convert placeholder <li> into <img> tag
            // elms can be either an array of elements or a single one
            makePlaceholderIntoImage: function (elms) {

                if (!elms || elms === null) {
                    return;
                }

                var numElements = elms.length;

                if (numElements > 1) {
                    for (var i=0, l=elms.length; i<l; i++) {
                        var item = elms[i];
                        if (item) {
                            view.processPlaceholder(item);
                        }
                    }
                } else { // it's just one item
                    view.processPlaceholder(elms);
                }
                
            },

            // actually updates the DOM
            processPlaceholder: function (placeholder) {
                var hasImage = placeholder.getAttribute('data-image');

                if (hasImage && hasImage === 'false') {
                    
                    var src = placeholder.getAttribute("data-src");
                    var orientation = placeholder.getAttribute("data-orientation");
                    var width = placeholder.getAttribute("data-width");
                    var height = placeholder.getAttribute("data-height");
                    if (src && src !== "") { // create <img> element
                        var html = '<img src="[SRC]" class="[CLASS]" data-width="[WIDTH]" data-height="[HEIGHT]" />';
                        var classList = 'js-gallery-img maxed ' + orientation;
                        
                        html = html.replace('[SRC]', src);
                        html = html.replace('[CLASS]', classList);
                        html = html.replace('[WIDTH]', width);
                        html = html.replace('[HEIGHT]', height);
                        
                        // prepend it to what's there already (caption etc)
                        placeholder.innerHTML = html + placeholder.innerHTML;
                        placeholder.setAttribute("data-image", "true");
                    }
                }

                return placeholder;
            }

        };

        this.init = function () {
            view.bindGallery();
        };

    };
        
    return Gallery;

});
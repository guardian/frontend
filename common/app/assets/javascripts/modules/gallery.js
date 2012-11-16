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
                currentlyShowingCaptions: false,
                fullscreenPlaceholder: document.getElementById('js-gallery-fullscreen-placeholder');
            },

            toggleCaptions: function (toggler) {
                
                var captionId = toggler.getAttribute('data-caption-id');
                var caption = document.getElementById('js-gallery-caption-' + captionId);
                var icon = toggler.querySelector('i'); // icon
                toggler = toggler.querySelector('span'); // text holder

                bonzo(icon).toggleClass('i-expand-plus i-contract-minus');
                bonzo(caption).toggleClass('js-hidden');
                if (bonzo(toggler).text() === "Show caption") {
                    bonzo(toggler).text('Hide caption');
                } else {
                    bonzo(toggler).text('Show caption');
                }
            },

            
            bindCaptionTogglers: function () {
                var galleryContainer = document.getElementById('js-gallery');
                bean.on(galleryContainer, 'click', '.js-gallery-caption-toggle', function(e) {
                    view.toggleCaptions(this);
                });

                // todo: put this somewhere else
                var galleryImgs = document.querySelectorAll('.js-gallery-img');
                for (var i=0, l=galleryImgs.length; i<l; i++) {
                    var elm = galleryImgs[i];
                    view.bindPopup(elm);
                }
            },

            bindPopup: function (elm) {
                elm.onclick = (function() {
                    return function() {
                        view.showFullscreenImage(elm);
                    }
                })();
            },
            
            showFullscreenImage: function (elm) {
                // copy gallery-nav to placeholder
                // replace its fullscreen button with a close one
                // copy caption/credit to hidden div
                // copy image to central position
                // bind toggle event on image to show caption
                // bind close button to kill the popup
                    // remove all bound events when closing

                var galleryNavHTML = document.getElementById('js-gallery-nav').innerHTML;
                bonzo(galleryNavHTML).appendTo(view.galleryConfig.fullscreenPlaceholder);
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
                    var gallerySwipe = new Swipe(document.getElementById('js-gallery-holder'), {
                        callback: function(event, index, elm) {

                            var count = document.getElementById('js-gallery-index');
                            var currentPos = parseInt(count.innerText, 10);
                            var nextIndex = parseInt(index, 10);
                            var nextIndexCount = nextIndex + 1;
                            
                            // track the swipe and its direction
                            if (nextIndexCount > currentPos) {
                                view.trackInteraction("swipe:forward");
                                view.advanceGallery('next');
                            } else {
                                view.trackInteraction("swipe:backward");
                                view.advanceGallery('prev');
                            }

                        }
                    });

                    // check if we need to jump to a specific gallery slide
                    if (urlParams.index) {
                        gallerySwipe.slide(parseInt(urlParams.index, 10)-1, 0);
                    }

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
                        if (e.keyCode === 37) { // left
                            view.trackInteraction("keyboard:previous");
                            view.advanceGallery('prev');
                        } else if (e.keyCode === 39) { // right
                            view.trackInteraction("keyboard:next");
                            view.advanceGallery('next');
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
                var currentIndex    = currentSlide.getAttribute('data-index');
                var totalSlides     = currentSlide.getAttribute('data-total');
                var isFirst         = (currentIndex === 1);
                var isLast          = (currentIndex === totalSlides);
                var slideCounter    = document.getElementById('js-gallery-index');
                
                // don't try to do anything if we're at the start/end going forward/back
                if ( (isFirst && directin === "prev") ||
                     (isLast && direction === "next") ) {
                    return;
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
                    newSlideIndex = (direction === 'next') ? (parseInt(currentIndex, 10) + 1) : (parseInt(currentIndex, 10) - 1);
                
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
                view.makePlaceholderIntoImage([prevSlide, elmToWorkWith, nextSlide]); 

                // make this slide active
                elmToWorkWith.className = view.galleryConfig.currentSlideClassName;
                elmToWorkWith.style.display = 'block';

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

                index = parseInt(index, 10); // just in case

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
                    if (src && src !== "") { // create <img> element
                        placeholder.innerHTML = '<img src="' + src + '" class="js-gallery-img maxed" />' + placeholder.innerHTML;
                        placeholder.setAttribute("data-image", "true");
                        view.bindPopup(placeholder.querySelector('img'));
                    }
                }

                return placeholder;
            }

        };

        this.init = function () {
            view.bindGallery();
            view.bindCaptionTogglers();
        };

    };
        
    return Gallery;

});
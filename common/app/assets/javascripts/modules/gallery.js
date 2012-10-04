define(["reqwest", "bean", "swipe", "common"], function (reqwest, bean, swipe, common) {

    var Gallery = function () {

        function getUrlVars () {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            var hash_length = hashes.length;
            for (var i = 0; i < hash_length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }

        var urlParams = getUrlVars();

        var view = {

            galleryConfig: {
                nextLink: document.getElementById('js-gallery-next'),
                prevLink: document.getElementById('js-gallery-prev'),
                currentIndex: urlParams.index || 0
            },

            // run on domloaded
            bindGallery: function () {
                  
                var isTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

                if(isTouch) { // only enable swiping for touch devices, duh.
                    
                    // add swipe styling
                    document.getElementById('js-gallery').className += ' gallery-swipe';

                    // when we load, grab the prev/next and show them too
                    var currentSlide = common.$g('.js-current-gallery-slide')[0];
                    //currentSlide = document.getElementsByClassName('js-current-gallery-slide')[0];

                    var nextSlide = currentSlide.nextElementSibling;
                    var prevSlide = currentSlide.previousElementSibling;
                    var totalSlides = currentSlide.getAttribute('data-total');

                    view.makePlaceholderIntoImage([nextSlide, prevSlide]);

                    // set up the swipe actions
                    var gallerySwipe = new swipe(document.getElementById('js-gallery'), {
                        callback: function(event, index, elm) {

                            var count = document.getElementById('js-gallery-index');

                            var nextIndex = parseInt(index, 10);
                            var nextIndexCount = nextIndex + 1;
                            var nextElm = common.$g('.gallery-swipe li')[nextIndex];

                            count.innerText = nextIndexCount;
                            view.updateURL('index=' + nextIndexCount, nextIndexCount);
                            view.handlePrevNextLinks(nextIndexCount, totalSlides);
                            
                            if(nextElm) {
                                var nextElmForward = nextElm.nextElementSibling;
                                var nextElmBackward = nextElm.previousElementSibling;
                                
                                // convert to <img> tag
                                view.makePlaceholderIntoImage([nextElm, nextElmForward, nextElmBackward]);

                                elm.style.display = 'block';
                            }

                        }
                    });

                    // check if we need to jump to a specific gallery slide
                    if(urlParams.index) {
                        gallerySwipe.slide(parseInt(urlParams.index, 10)-1, 0);
                    }

                    // bind prev/next to just trigger swipes
                    bean.add(view.galleryConfig.nextLink, 'click', function(e) {
                        gallerySwipe.next();
                        e.preventDefault();
                    });

                    bean.add(view.galleryConfig.prevLink, 'click', function(e) {
                        gallerySwipe.prev();
                        e.preventDefault();
                    });

                } else {

                    bean.add(view.galleryConfig.nextLink, 'click', function(e) {
                        view.advanceGallery('next');
                        e.preventDefault();
                    });

                    bean.add(view.galleryConfig.prevLink, 'click', function(e) {
                        view.advanceGallery('prev');
                        e.preventDefault();
                    });

                    bean.add(document, 'keydown', function(e){
                        if (e.keyCode == 37) {
                            view.advanceGallery('prev');
                        } else if (e.keyCode == 39) {
                            view.advanceGallery('next');
                        }
                    });

                }

                // this means the user used the back/forward buttons
                // so we should change gallery state to match
                window.onpopstate = function(event) {
                    var urlParams = getUrlVars(); // fetch again
                    if(urlParams.index) {
                        var matches = urlParams.index.match(/\d+/); // URL params can become like ?index=10#top
                        if (matches) {
                            urlParams.index = matches[0];
                            view.advanceGallery(null, urlParams.index);
                        }
                    }
                };

            },

            advanceGallery: function (direction, customItemIndexToShow) {

                var currentSlide    = document.getElementsByClassName('js-current-gallery-slide')[0];
                var nextSlide       = currentSlide.nextElementSibling;
                var prevSlide       = currentSlide.previousElementSibling;
                var currentIndex    = currentSlide.getAttribute('data-index');
                var totalSlides     = currentSlide.getAttribute('data-total');
                var isFirst         = (currentIndex == 1);
                var isLast          = (currentIndex == totalSlides);
                var slideCounter    = document.getElementById('js-gallery-index');
                
                if ( (isFirst && direction === "prev") ||
                     (isLast && direction === "next") ) {
                    return;
                }

                var elmToWorkWith, newSlide;

                // hide the current slide
                currentSlide.className = '';
                currentSlide.style.display = 'none';

                if(!customItemIndexToShow) {

                    // choose the element to show
                    elmToWorkWith = (direction == 'next') ? nextSlide : prevSlide;

                    // update counter
                    newSlide = (direction == 'next') ? (parseInt(currentIndex, 10) + 1) : (parseInt(currentIndex, 10) - 1);
                
                } else {
                    elmToWorkWith = document.getElementById('js-gallery-item-' + customItemIndexToShow);
                    newSlide = customItemIndexToShow;
                }

                // show and hide next/prev links
                view.handlePrevNextLinks(newSlide, totalSlides);

                slideCounter.innerHTML = newSlide; // update count of current position

                view.updateURL('index=' + newSlide, newSlide);
                view.makePlaceholderIntoImage(elmToWorkWith); // convert it if we need to

                elmToWorkWith.className = 'js-current-gallery-slide';
                elmToWorkWith.style.display = 'block';

            },

            updateURL: function (querystring, index) {
                var supportsPushState = 'pushState' in history;

                var state = window.location.search.replace( /^\?/, '' );
                
                if (supportsPushState) {
                    if ( querystring !== state ) {
                        history.pushState({}, (window.title || '') + ' (' + index + ')', '?' + querystring);
                    }
                }
            },

            handlePrevNextLinks: function (index, total) {
                var nextLink = view.galleryConfig.nextLink;
                var prevLink = view.galleryConfig.prevLink;

                if (index == 1) { // we've gone back to the start, hide prev
                    prevLink.style.display = 'none';
                    nextLink.setAttribute('href', '?index=2');
                } else if (index == 2) { // we can now go back, show prev
                    prevLink.style.display = 'inline';
                    prevLink.setAttribute('href', '?index=1');
                    nextLink.setAttribute('href', '?index=3');
                } else if (index == total-1) { // show next again...?
                    nextLink.style.display = 'inline';
                    prevLink.setAttribute('href', '?index=' + (index - 1));
                    nextLink.setAttribute('href', '?index=' + total);
                } else if (index == total) { //we're at the end, hide next
                    nextLink.style.display = 'none';
                    prevLink.setAttribute('href', '?index=' + (total -1));
                } else { // it's in the middle
                    prevLink.setAttribute('href', '?index=' + (index - 1));
                    nextLink.setAttribute('href', '?index=' + (index + 1));
                }
            },

            // used to to convert placeholder <li> into <img> tag
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

                if (hasImage && hasImage == 'false') {
                    
                    var src = placeholder.getAttribute("data-src");
                    if (src && src !== "") { // create <img> element
                        placeholder.innerHTML = '<img src="' + src + '" />' + placeholder.innerHTML;
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
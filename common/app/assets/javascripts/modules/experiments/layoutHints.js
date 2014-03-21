define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/detect',
    'common/modules/ui/relativedates',
    'lodash/collections/filter',
    'common/modules/experiments/affix'
], function(bonzo, qwery, bean, detect, relativeDates, _filter, Affix){

    function Layout(config) {
        var slug = config.page.pageId.split("/").pop().replace('-sp-', '');

        if(slug in this.content) {
            this.container = document.getElementById('article');
            bonzo(this.container).addClass('layout-hints ' + slug);
            this.content[slug](config);
        }
    }

    Layout.prototype.content = {
        "rescue-from-antarctica" : function() {
            var img = bonzo(new Image()),
                imgs = qwery('.element-image', this.container),
                videos = bonzo(qwery('video', this.container)),
                breakpoint = detect.getBreakpoint();

            img.addClass('media-primary media-primary--full-width');
            img.attr('src', 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/2/26/1393435299650/Antarcticaleadimage.jpg');
            img.insertBefore(qwery('.article__columning-wrapper', this.container));
            bonzo(imgs[0]).addClass('img--supporting');
            bonzo(imgs[3]).addClass('img--supporting');
            videos.each(function(vid) {
                if(breakpoint === 'wide')  {
                    bean.on(vid, 'loadeddata', function() {
                        this.setAttribute('poster', '');
                    }, vid);
                }
                vid.removeAttribute('controls');
                vid.setAttribute('autoplay', 'autoplay');
                vid.setAttribute('loop', 'loop');
                vid.setAttribute('muted', 'muted');

                vid.play();
            });
        },

        "russia-sanctions-keep-markets-anxious" : function(config) {
            /*jshint nonew:false */

            if(!config.switches.keyEvents) { return false; }

            var containerTmp = '<div class="key-events js-key-events"><div class="key-events__container js-key-events__container"><h2 class="key-events__head">In brief...</h2>' +
                '               <ul class="key-events__list u-unstyled" data-link-name="key-events">{{items}}</ul></div></div>';
            var itemTmp = '<li class="key-events__item js-key-event u-cf"><span class="key-events__item__time">{{time}}</span>' +
                            '<a class="key-events__item__text" href="{{hash}}">{{title}}</a></li>';
            var articleHeight = bonzo(qwery('.js-article__container')).dim().height;

            //Loop over key events and append to fragment
            var items = _filter(qwery('.is-key-event', this.container), function(el) {
                return qwery('.block-title', el).length;
            }).map(function(el) {
                var tmp = itemTmp.replace('{{hash}}', '#' + el.id);
                    tmp = tmp.replace('{{time}}', qwery('.block-time', el)[0].innerHTML);
                    tmp = tmp.replace('{{title}}', bonzo(qwery('.block-title', el)).text());
               return tmp;
            }).join(' ');

            //Clear right hand column and insert items
            bonzo(qwery('.js-right-hand-component')).empty().prepend(containerTmp.replace('{{items}}', items));

            var eventsEl = qwery('.js-key-events');
            bonzo(eventsEl).css('height', articleHeight).each(function(el) {
                bonzo(qwery('time', el)).addClass('js-timestamp').attr('data-relativeformat', 'short');
            });
            new Affix({
                element: qwery('.js-key-events__container', eventsEl)[0],
                offset: { top : 600, bottom: 1000 }
            });
            relativeDates.init(qwery('.js-key-events'));

            //HIde toolbar
            bonzo(qwery('.live-toolbar')).addClass('mobile-and-tablet-only');

            //Bind listeners
            bean.on(qwery('.js-key-events')[0], 'click', '.js-key-event', function() {
                bonzo(qwery('.js-key-event')).removeClass('is-active');
                bonzo(this).addClass('is-active');
            });
        }
    };

    return Layout;

});
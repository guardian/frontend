define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/detect',
    'lodash/collections/filter'
], function(bonzo, qwery, bean, detect, _filter){

    function Layout(config) {
        var slug = config.page.pageId.split("/").pop().replace('-sp-', '');

        if(slug in this.content) {
            this.container = document.getElementById('article');
            bonzo(this.container).addClass('layout-hints ' + slug);
            this.content[slug]();
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

        "mps-debate-ukraine-politics-live-blog" : function() {
            var containerTmp = '<h2 class="key-events__head">In brief...</h2><ul class="key-events js-key-events u-unstyled" data-link-name="key-events">{{items}}</ul>';
            var itemTmp = '<li class="key-events__item media"><span class="key-events__item__time media__img">{{time}}</span>' +
                            '<a class="key-events__item__text media__body" href="{{hash}}">{{title}}</a></li>';

            //Loop over key events and append to fragment
            var items = _filter(qwery('.is-key-event', this.container), function(el) {
                return qwery('.block-title', el).length;
            }).map(function(el) {
                var tmp = itemTmp.replace('{{hash}}', '#' + el.id);
                    tmp = tmp.replace('{{time}}', bonzo(qwery('.block-time', el)).text());
                    tmp = tmp.replace('{{title}}', bonzo(qwery('.block-title', el)).text());
               return tmp;
            }).join(' ');

            //Clear right hand column and insert items
            bonzo(qwery('.js-right-hand-component')).empty().addClass('u-sticky').prepend(containerTmp.replace('{{items}}', items));
        }
    };

    return Layout;

});
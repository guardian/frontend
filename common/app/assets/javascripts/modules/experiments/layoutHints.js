define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/detect'
], function(bonzo, qwery, bean, detect){

    function Layout(config) {
        var slug = config.page.pageId.split('/').pop().replace('-sp-', '');

        if(slug in this.content) {
            this.container = document.getElementById('article');
            bonzo(this.container).addClass('layout-hints ' + slug);
            this.content[slug](config);
        }
    }

    Layout.prototype.content = {
        'rescue-from-antarctica' : function() {
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
        }
    };

    return Layout;

});

define([
    'bonzo',
    'qwery'
], function(bonzo, qwery){

    function Layout(config) {
        var slugs = config.page.pageId.split("/"),
            slug = slugs[slugs.length -1].replace('-sp-', '');

        if(slug in this.content) {
            this.container = document.getElementById('article');
            bonzo(this.container).addClass('layout-hints ' + slug);
            this.content[slug]();
        }
    }

    Layout.prototype.content = {
        "rescue-from-antarctica" : function() {
            var img = new Image();
            var imgs = qwery('.element-image', this.container);
            var videos = bonzo(qwery('video', this.container));
            img.className = 'media-primary media-primary--full-width';
            img.setAttribute('src', 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/2/26/1393435299650/Antarcticaleadimage.jpg');
            bonzo(img).insertBefore(qwery('.article__columning-wrapper', this.container));
            bonzo(imgs[0]).addClass('img--supporting');
            bonzo(imgs[3]).addClass('img--supporting');
            videos.each(function(vid) {
                vid.removeAttribute('controls');
                vid.setAttribute('loop', 'loop');
                vid.play();
            });
        }
    };

    return Layout;

});
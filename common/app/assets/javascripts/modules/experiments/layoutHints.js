define([
    'bonzo',
    'common/$',
    'common/modules/ui/images'
], function($, images){

    function Layout(config) {
        var slugs = config.page.pageId.split("/"),
            slug = slugs[slugs.length -1];

        if(slug in this.content) {
            this.container = document.getElementById('article');
            $(this.container).addClass('layout-hints ' + slug);
            this.content[slug]();
        }
    }

    Layout.prototype.content = {
        "fast-ice-rescue-from-antarctica" : function() {
            var img = new Image();
            img.className = 'responsive-img';
            img.setAttribute('data-src', 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/2/26/1393435299650/Antarcticaleadimage.jpg');
            $('.article__main-column', this.container).before(img);
            images.upgrade(this.container);
        }
    };

    return Layout;

});

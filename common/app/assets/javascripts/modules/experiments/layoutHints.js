define([
    "common/$",
    'common/modules/ui/images'
], function($, images){

    var content = {
        "fast-ice-rescue-from-antarctica" : function() {
            var img = new Image();
            img.className = 'responsive-img';
            img.setAttribute('data-src', 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/2/26/1393435299650/Antarcticaleadimage.jpg');
            $('.article__main-column').before(img);
        }
    };

    function init(config) {
        var slugs = config.page.pageId.split("/"),
            slug = slugs[slugs.length -1];

        $('article').addClass('layout-hints ' + slug);
        content[slug]();
    }

    return {
        init: init
    };

});

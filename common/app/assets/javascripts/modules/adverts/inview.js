define([
    'common',
    'bean',
    'bonzo',
    'modules/adverts/document-write',
    'modules/adverts/documentwriteslot',
    'modules/inview'
], function (
    common,
    bean,
    bonzo,
    documentWrite,
    DocumentWriteSlot,
    Inview
) {

    function insertContainer(el) {
        var container = bonzo.create('<div class="ad-slot ad-slot-inview"><div class="ad-container"></div></div>');
        bonzo(container).insertAfter(el);
        return container.children[0];
    }

    function loadAdvert(context, size) {
        return function(el) {
            name = el.getAttribute('data-' + size);
            slot = new DocumentWriteSlot(name, insertContainer(el), context);
            domwrite.capture();
            slot.render();
        }
    }

    function labelParagraphs(context) {
        common.$g('.article-body p:nth-of-type(5n)', context).attr({
            'data-inview-advert' : 'true',
            'data-base' : 'x09',
            'data-median' : 'x08',
            'data-extended' : 'x08'
        });
    }

    function bindListeners(callback) {
        common.mediator.on('modules:inview:visible', function(el) {
            if(el.getAttribute('data-inview-advert')) {
                callback();
            }
        });
    }

    function InView(context, size) {
        bindListeners(loadAdvert(context, size));
        labelParagraphs(context);

        var inview = new Inview('[data-inview-name]', context);
    }

    return InView;
});
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

    function loadAdvert(config, context, size) {
        return function(el) {
            console.log('inside inview render callback');
            name = el.getAttribute('data-' + size);
            slot = new DocumentWriteSlot(name, insertContainer(el), context);
            common.mediator.on('modules:adverts:docwrite:loaded', function() {
                console.log('inside inview advert loaded');
                domwrite.capture();
                slot.render();
            });
            documentWrite.load({
                config: config,
                slots: [slot]
            });
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
            console.log('inside inview event');
            if(el.getAttribute('data-inview-advert')) {
                callback();
            }
        });
    }

    function InView(config, context, size) {
        console.log('inside inview');
        bindListeners(loadAdvert(config, context, size));
        labelParagraphs(context);

        var inview = new Inview('[data-inview-name]', context);
    }

    return InView;
});
//javascript:(function()%7Bdocument.body.appendChild(document.createElement('script')).src='http://localhost:8000/gudev/frontend/tools/grid-bookmarklet/grid.js?'+(new Date()).getTime();%7D)();
require([
    'common',
    'bonzo',
    'bean'
], function (
    common,
    bonzo,
    bean
) {

    var scriptBase = document.querySelector('script[src*="grid.js"]').src.split('grid.js?')[0],
        cssUrl     = scriptBase + 'grid.css',
        docW,
        docH,
        $gridEl;


    function init() {
        // Clean up and load stylesheet
        common.$g('.grid-overlay, link[href*="grid.css"], script[src*="grid.js"]').remove();
        bonzo(document.querySelector('head')).append('<link rel="stylesheet" href="'+cssUrl+'" type="text/css" />');
    }


    function buildGrid() {
        // Build grid template
        var gridTemplate = '<div class="grid-overlay">' +
                           '  <div class="grid-cols"></div>' +
                           '  <div class="grid-rows"></div>' +
                           '</div>'
        $gridEl = bonzo(bonzo.create(gridTemplate));
        layout();

        var $colsEl = bonzo($gridEl[0].querySelector('.grid-cols')),
            $rowsEl = bonzo($gridEl[0].querySelector('.grid-rows'));

        // First came the columns...
        for (var i=0; i<20; i++) {
            $colsEl.append('<div class="grid-column"></div>');
        }

        // ...and then the rows
        for (var i=0; i<(docH/60); i++) {
            $rowsEl.append('<div class="grid-row"></div>');
        }

        bonzo(document.body).append($gridEl);
    }


    function layout() {
        // Get document dimensions
        var $doc = bonzo(document);
        docW = $doc.dim().width,
        docH = $doc.dim().height;

        $gridEl.css({
            width:  docW+'px',
            height: docH+'px'
        });
    }


    function bindEvents() {
        // Event handlers
        var startingX,
            startingY,
            startingGridTop,
            staringGridLeft,
            dragging;

        bean.on(window, 'resize', common.debounce(function(e){
            layout();
        }, 500));

        bean.on(document.body, 'keydown', function(e) {
            if (e.keyCode === 71) { // g key - toggle grid visiblity
                $gridEl.toggleClass('is-hidden');
            }
        });

        bean.on(document.querySelector('.grid-overlay'), 'mousedown', function(e) {
            dragging = true;
            startingX = e.pageX;
            startingY = e.pageY;
            startingGridTop = parseInt($gridEl.css('top'), 10);
            startingGridLeft = parseInt($gridEl.css('left'), 10);
        });

        bean.on(document.querySelector('.grid-overlay'), 'mousemove', function(e) {
            if (dragging == true) {
                var offsetX = e.pageX - startingX,
                    offsetY = e.pageY - startingY;

                $gridEl[0].style.left = (startingGridLeft + offsetX) + 'px';
                $gridEl[0].style.top  = (startingGridTop + offsetY) + 'px';
            }
        });

        bean.on(document.querySelector('.grid-overlay'), 'mouseup', function(e) {
            dragging = false;
        });
    }



    init();
    buildGrid();
    layout();
    bindEvents();

});

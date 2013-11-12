//javascript:(function()%7Bdocument.body.appendChild(document.createElement('script')).src='https://raw.github.com/guardian/frontend/master/tools/grid-bookmarklet/grid.js?'+(new Date()).getTime();%7D)();

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
        colWidth   = 80, // 60 + 20
        rowHeight  = 48, // 36 + 12
        docW,
        docH,
        gridIsVisible = true,
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
                           '</div>';

        if (!$gridEl) {
            $gridEl = bonzo(bonzo.create(gridTemplate));
            bonzo(document.body).append($gridEl);
        }

        layout();

        var $colsEl = bonzo($gridEl[0].querySelector('.grid-cols')),
            $rowsEl = bonzo($gridEl[0].querySelector('.grid-rows'));

        // First came the columns...
        $colsEl.empty();
        for (var i=0; i<(docW/colWidth); i++) {
            leftPos = i * colWidth;
            $colsEl.append('<div class="grid-column" style="left: '+leftPos+'px"></div>');
        }

        // ...and then the rows
        $rowsEl.empty();
        for (var i=0; i<(docH/rowHeight); i++) {
            topPos = i * rowHeight;
            $rowsEl.append('<div class="grid-row" style="top: '+topPos+'px"></div>');
        }
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

        // Set these again, in case they've changed
        docW = $doc.dim().width,
        docH = $doc.dim().height;
    }


    function bindEvents() {
        // Event handlers
        var startingX,
            startingY,
            startingGridTop,
            staringGridLeft,
            dragging;

        bean.on(window, 'resize', common.debounce(function(e){
            buildGrid();
        }, 500));

        bean.on(document.body, 'keydown', function(e) {
            startingGridTop = parseInt($gridEl.css('top'), 10);
            startingGridLeft = parseInt($gridEl.css('left'), 10);
            var moveBy = e.shiftKey ? 5 : 1; // Move faster when shift key is down

            if (e.keyCode === 71) {
                // g key - toggle grid visiblity
                $gridEl.toggleClass('is-hidden');
                gridIsVisible = gridIsVisible ? false : true;
            } else if (e.keyCode === 68) {
                // d key - desaturate content area
                bonzo(document.body).toggleClass('is-desaturated');
            } else if (e.keyCode === 38) {
                // Up
                $gridEl[0].style.top = (startingGridTop - moveBy) + 'px';
            } else if (e.keyCode === 40) {
                // Down
                $gridEl[0].style.top = (startingGridTop + moveBy) + 'px';
            } else if (e.keyCode === 37) {
                // Left
                $gridEl[0].style.left = (startingGridLeft - moveBy) + 'px';
            } else if (e.keyCode === 39) {
                // Right
                $gridEl[0].style.left = (startingGridLeft + moveBy) + 'px';
            }

            if ([71,68,38,40,37,39].indexOf(e.keyCode) != -1 && gridIsVisible) {
                e.preventDefault();
            }
        });

        bean.on(document.querySelector('.grid-overlay'), {
            mousedown: function(e) {
                dragging = true;
                startingX = e.pageX;
                startingY = e.pageY;
                startingGridTop = parseInt($gridEl.css('top'), 10);
                startingGridLeft = parseInt($gridEl.css('left'), 10);
            },

            mousemove: function(e) {
                if (dragging == true) {
                    var offsetX = e.pageX - startingX,
                        offsetY = e.pageY - startingY;

                    $gridEl[0].style.left = (startingGridLeft + offsetX) + 'px';
                    $gridEl[0].style.top  = (startingGridTop + offsetY) + 'px';
                }
            },

            'mouseup mouseout': function(e) {
                dragging = false;
            }
        });


        // Check for document size changes, and repaint the grid if needed
        setInterval(function() {
            var $doc = bonzo(document);
            if (docW !== $doc.dim().width || docH !== $doc.dim().height) {
                buildGrid();
            }
        }, 2000);
    }



    init();
    buildGrid();
    bindEvents();

});

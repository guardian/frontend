define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect'
], function (
    $,
    _,
    detect
    ) {

    var w = window,
        d = document,
        e = d.documentElement,
        winHeight,

        vPosNow = w.scrollY,
        vPosCache,

        headers,
        headerPositions = [],

        headerOne,
        headerOnePosition,

        titleOne,
        titleOneHeight,

        stickyTitles,
        stickyTitlesContainer,

        offsets = [],
        lastIndex = -1;

    function getWindowHeight() {
        return w.innerHeight || e.clientHeight;
    }

    function getPosition(el) {
        return vPosNow + el.getBoundingClientRect().top;
    }

    function getMetrics() {
        if (headerPositions[lastIndex] !== getPosition(headers[lastIndex])) {
            headerPositions = headers.map(getPosition);
            winHeight = getWindowHeight();
            headerOnePosition = getPosition(headerOne);
        }
    }

    function setPositions() {
        vPosNow = w.scrollY;

        if (vPosCache !== vPosNow) {
            vPosCache = vPosNow;

            if (winHeight - stickyTitlesContainer.offsetHeight < headerOnePosition - vPosNow + titleOneHeight + 100) {
                $(stickyTitlesContainer).removeClass('fixed');
            } else {
                $(stickyTitlesContainer).addClass('fixed');
            }

            stickyTitles.forEach(function (el, i) {
                if (headerPositions[i] > winHeight + vPosNow - offsets[i] + 0) {
                    $(el).show();
                } else {
                    $(el).hide();
                }
            });
        }
    }

    function init() {
        if (['desktop', 'wide'].indexOf(detect.getBreakpoint(true)) > -1) {
            headers = Array.prototype.slice.call(document.querySelectorAll('section:not(.fc-container--thrasher) .js-container__header')).filter(function (section) {
                return section.querySelector('.fc-container__header__title');
            });

            headerOne = headers.splice(0, 1)[0];
            lastIndex = headers.length - 1;

            titleOne = headerOne.querySelector('.fc-container__header__title');
            titleOneHeight = titleOne.offsetHeight;

            headerOne.insertAdjacentHTML('beforeend',
                '<div class="fc-container__header__title--stickies">' +
                    headers.map(function (header) {
                        return '<div class="fc-container__header__title--sticky">' + header.querySelector('.fc-container__header__title').innerText + '</div>';
                    }).join('') +
                '</div>'
            );

            stickyTitlesContainer = headerOne.querySelector('.fc-container__header__title--stickies');

            stickyTitles = Array.prototype.slice.call(stickyTitlesContainer.querySelectorAll('.fc-container__header__title--sticky'));

            stickyTitles.reduceRight(function (m, title, i) {
                var height = title.offsetHeight + m;

                offsets[i] = height;
                return height;
            }, 0);

            getMetrics();
            setPositions();

            $(stickyTitlesContainer).css('visibility', 'visible');

            setInterval(getMetrics, 500);
            setInterval(setPositions, 50);

            stickyTitles.forEach(function (el, index) {
                el.addEventListener('click', function (e) {
                    if (el.classList.contains('fixed')) {
                        w.scrollTo(0, headerPositions[index]);
                        e.preventDefault();
                    }
                });
            });
        }
    }

    return {
        init: _.once(init)
    };
});

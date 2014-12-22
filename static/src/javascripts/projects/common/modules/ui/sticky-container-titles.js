define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/template'
], function(
    $,
    _,
    config,
    template
    ) {

    function init() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            winWidth = w.innerWidth || e.clientWidth || g.clientWidth,
            winHeight = w.innerHeight || e.clientHeight || g.clientHeight,

            vPosNow = w.scrollY,
            vPosCache,
            vPosAll = [],

            headers,
            headerOne,
            headerOnePos,

            titles,
            titleOne,
            titleOneHeight,
            titleOneWidth,

            nav,

            heights = [],
            offsets = [],
            lastIndex = -1;

        function getPosition(el) {
            return vPosNow + el.getBoundingClientRect().top;
        }

        function getPositions() {
            if (vPosAll[lastIndex] !== getPosition(headers[lastIndex])) {
                winHeight = w.innerHeight || e.clientHeight || g.clientHeight;
                vPosAll = headers.map(getPosition);
                headerOnePos = getPosition(headerOne);
            }
        }

        function setPositions() {
            vPosNow = w.scrollY;

            if (vPosCache !== vPosNow) {
                vPosCache = vPosNow;

                if (winHeight - nav.offsetHeight < headerOnePos - vPosNow + titleOneHeight + 100) {
                    nav.classList.remove('fixed');
                } else {
                    nav.classList.add('fixed');
                }

                titles.forEach(function(el, i) {
                    if (vPosAll[i] > winHeight + vPosNow - offsets[i] + 0) {
                        el.style.display = 'block';
                    } else {
                        el.style.display = 'none';
                    }
                });
            }
        }

        function addCss(width) {
            var css = document.createElement('style');
            css.type = 'text/css';
            css.innerHTML = '.fc-container__header__titles.fixed {width: ' + width + 'px;}';
            document.body.appendChild(css);
        }

        if (winWidth >= 1024) {
            headers = Array.prototype.slice.call(document.querySelectorAll('section:not(.fc-container--thrasher) .js-container__header')).filter(function(section) {
                return section.querySelector('.fc-container__header__title');
            })

            headerOne = headers.splice(0, 1)[0];
            titleOne = headerOne.querySelector('.fc-container__header__title');
            titleOneHeight = titleOne.offsetHeight;
            titleOneWidth = titleOne.offsetWidth;

            headerOne.insertAdjacentHTML('beforeend',
                '<div class="fc-container__header__titles">' +
                    headers.map(function(header) {
                        return '<div class="fc-container__header__title fixed">' + header.querySelector('.fc-container__header__title').innerText + '</div>';
                    }).join('') +
                '</div>'
            );

            nav = headerOne.querySelector('.fc-container__header__titles');

            titles = Array.prototype.slice.call(nav.querySelectorAll('.fc-container__header__title'));

            lastIndex = titles.length - 1;

            addCss(titleOneWidth);

            for (var i = lastIndex; i >= 0; i -= 1) {
                heights[i] = titles[i].offsetHeight;
                offsets[i] = heights[i] + (offsets[i + 1] || 0);
            }

            getPositions();
            setPositions();

            nav.style.visibility = 'visible';

            setInterval(getPositions, 51);
            setInterval(setPositions, 11);

            titles.forEach(function(el, index) {
                el.addEventListener('click', function(e) {
                    if (el.classList.contains('fixed')) {
                        w.scrollTo(0, vPosAll[index]);
                        e.preventDefault();
                    }
                });
            });
        }
    }

    return {
        init: _.once(init)
    }
});
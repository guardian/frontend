define([
    'bean',
    'fastdom',
    'Promise',
    'qwery',
    'lib/$',
    'lib/storage',
    'lib/config',
    'lib/template',
    'common/views/svg',
    'raw-loader!common/views/experiments/reading-time.html',
    'svg-loader!svgs/icon/marque-36.svg',
    'svg-loader!svgs/icon/clock.svg',
], function (
    bean,
    fastdom,
    Promise,
    qwery,
    $,
    storage,
    config,
    template,
    svg,
    readingTimeTemplate,
    guardianLogo,
    clock,
) {
    return function () {
        this.id = 'ReadingTime';
        this.start = '2017-03-15';
        this.expiry = '2017-03-31'; //to be set to run for a week when audience > 0 change is merged
        this.author = 'Leigh-Anne Mathieson';
        this.description = 'Add a thrasher to the home front that gives users an option to indicate how much time they'
            + ' have to read, to determine demand for suggesting content based on the amount of time they have.';
        this.audience = 0; // to be 0.029
        this.audienceOffset = 0; //just needs to not clash with recommended for you, which is offset 0.2
        this.successMeasure = 'Number of clicks';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will visit more often';

        var $sectionBelowReadingTime;
        var $readingTimeSelection = null;

        this.canRun = function () {
            $sectionBelowReadingTime = $('#opinion');
            return config.page.contentType === 'Network Front' && $sectionBelowReadingTime.length;
        };

        this.variants = [
            {
                id: 'static-links',
                test: function () {
                    insertReadingTimeSelection();
                },
                success: function(complete) {
                    insertReadingTimeSelection(complete)
                }
            },
            {
                id: 'control',
                test: function () {},
                success: function(complete) {}
            }
        ];

        function insertReadingTimeSelection(completeFunction) {
            $readingTimeSelection = $.create(template(readingTimeTemplate, {
                guardianLogo: svg(guardianLogo.markup),
                clock: svg(clock.markup)
            }));
            registerTimeSelectionHandlers($readingTimeSelection, completeFunction);

            return fastdom.write(function() {
                $readingTimeSelection.insertBefore($sectionBelowReadingTime);
            });
        }

        function registerTimeSelectionHandlers(section, completeFunction) {
            var arrow = '<div class="btn"><svg width="24" height="24" viewBox="240 334 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(240 334)"><path fill="#F6F6F6" d="M4 12.68h13.3l-5.22 6.15.68.67L20 12.34v-.68L12.76 4.5l-.68.67 5.2 6.15H4"/></path></g></svg></div>';

            bean.on($('.js-feedback-button-5', section)[0], 'click', function() {
                var suggestion = 'If you have five minutes, you might enjoy our latest photo gallery  <a href="https://www.theguardian.com/news/series/ten-best-photographs-of-the-day/latest">'+arrow+'</a>';

                replaceWithLink(suggestion);
                completeEvent(completeFunction);
            });

            bean.on($('.js-feedback-button-15', section)[0], 'click', function() {
                var suggestion = 'If you have fifteen minutes, you might enjoy our latest politics live blog  <a href="https://www.theguardian.com/politics/series/politics-live-with-andrew-sparrow/latest">'+arrow+'</a>';

                replaceWithLink(suggestion);
                completeEvent(completeFunction);
            });

            bean.on($('.js-feedback-button-30', section)[0], 'click', function() {
                var suggestion = 'If you have thirty minutes, you might enjoy our latest long read  <a href="https://www.theguardian.com/news/series/the-long-read/latest">'+arrow+'</a>';

                replaceWithLink(suggestion);
                completeEvent(completeFunction);
            });
        }

        function replaceWithLink(suggestionHtml){
            $('.cta').empty();
            $('.cta').html(suggestionHtml);
            $('.selections').empty();
        }

        function completeEvent(completeFunction){
            if (completeFunction) {
                completeFunction();
            }
        }
    }

});

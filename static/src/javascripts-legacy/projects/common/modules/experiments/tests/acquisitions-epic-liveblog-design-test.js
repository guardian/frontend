define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'lib/$',
    'raw-loader!common/views/acquisitions-epic-liveblog.html',
    'raw-loader!common/views/acquisitions-epic-liveblog-old-design-subtle.html',
    'raw-loader!common/views/acquisitions-epic-liveblog-old-design-minimal.html',
    'common/modules/commercial/acquisitions-copy',

], function (
    contributionsUtilities,
    geolocation,
    template,
    config,
    $,
    liveblogEpicTemplateControl,
    liveblogEpicTemplateOldDesignSubtle,
    liveblogEpicTemplateOldDesignMinimal,
    acquisitionsCopy
) {

    var pageId = config.page.pageId || '';

    var insertEpicAfterSelector = '.js-insert-epic-after';

    function isEpic(el) {
        $(el).hasClass('is-liveblog-epic');
    }

    function getLiveblogEntryTimeData(el) {
        var $timeEl = $('time', el);

        return {
            datetime: $timeEl.attr('datetime'),
            title: $timeEl.attr('title'),
            date: $timeEl.text(),
            time: $('.block-time__absolute', el).text()
        };
    }

    function getNextEpicElement(el) {
        var $epic = $(el).next();

        while ($epic.length && !isEpic($epic[0])) {
            $epic = $epic.next();
        }

        if (!isEpic($epic[0])) {
            return null;
        }

        return $epic[0];
    }

    function setEpicLiveblogEntryTimeData(el, timeData) {
        var $epicTimeEl = $('time', el);
        $epicTimeEl.attr('datetime', timeData.datetime);
        $epicTimeEl.attr('title', timeData.title);
        $epicTimeEl.text(timeData.date);
        $('.block-time__absolute', el).text(timeData.time);
    }

    function copyLiveblogEntryTimeDataToEpic() {
        $(insertEpicAfterSelector).each(function(el) {
            var timeData = getLiveblogEntryTimeData(el);
            var nextEpicElement = getNextEpicElement(el);
            setEpicLiveblogEntryTimeData(nextEpicElement, timeData);
        });
    }

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicLiveblogDesignTest',
        campaignId: 'epic_liveblog_design_test',
        campaignSuffix: pageId.replace(/-/g, '_').replace(/\//g, '__'),

        start: '2017-04-01',
        expiry: '2018-04-01',

        author: 'Joseph Smith',
        description: 'Test different variants of the Epic in the liveblog',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We establish which variant of the Epic to display in the liveblog; we acquire data for related work.',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        showForSensitive: true,

        pageCheck: function(page) {
            return page.contentType === 'LiveBlog';
        },

        variants: [
            {
                id: 'control',
                isUnlimited: true,

                insertAtSelector: insertEpicAfterSelector,
                insertAfter: true,
                insertMultiple: true,
                successOnView: true,

                template: function (variant) {
                    return template(liveblogEpicTemplateControl, {
                        copy: acquisitionsCopy.control,
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                },
            },
            {
                id: 'old_design_subtle',
                isUnlimited: true,

                insertAtSelector: insertEpicAfterSelector,
                insertAfter: true,
                insertMultiple: true,
                successOnView: true,

                template: function (variant) {
                    return template(liveblogEpicTemplateOldDesignSubtle, {
                        copy: acquisitionsCopy.liveblogSubtle,
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                },

                onInsert: copyLiveblogEntryTimeDataToEpic
            },
            {
                id: 'old_design_minimal',
                isUnlimited: true,

                insertAtSelector: insertEpicAfterSelector,
                insertAfter: true,
                insertMultiple: true,
                successOnView: true,

                template: function (variant) {
                    return template(liveblogEpicTemplateOldDesignMinimal, {
                        copy: acquisitionsCopy.liveblogMinimal,
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                },

                onInsert: copyLiveblogEntryTimeDataToEpic
            }
        ]
    });
});

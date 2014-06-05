define([
    'common/utils/ajax',
    'common/$',
    'common/utils/template',
    'common/modules/ui/images'
], function (ajax, $, template, images) {

    return function () {
        this.id = 'AcrossTheGuardian';
        // not starting the test just yet, in now so we can style the component correctly for this spot
        this.start = '2014-05-30';
        this.expiry = '2014-06-25';
        this.author = 'Raul Tudor';
        this.description = 'Testing a new container that gives our users an overview of latest content across all main site sections';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Click Through Rate on Network Front. Clicks on this container and affect on others.';
        this.audienceCriteria = 'Network Front visitors';
        this.dataLinkNames = 'across-the-guardian';
        this.idealOutcome = 'At least 1% increase in overall page level click through rate';

        var edition = window.location.pathname;
        this.canRun = function () {
            return ['/uk', '/us', '/au'].indexOf(edition) > -1;
        };

        var templates = {
            'container': '<section class="container container--acrossthegrauniad container--acrossthegrauniad-variant-{{variant}}" data-link-name="block | across-the-guardian" data-component="across-the-guardian">' +
                '    <div class="facia-container__inner">' +
                '        <div class="container__border tone-news tone-accent-border"></div>' +
                '        <h2 class="container__title tone-news tone-background">' +
                '           <span class="container__title__label u-text-hyphenate">{{containerTitle}}</span>' +
                '        </h2>' +
                '        <div class="container__body">{{body}}</div>' +
                '    </div>' +
                '</section>',
            '2col': '<ul class="u-unstyled across across--columns">{{items}}</ul>',
            '3col': '<div class="facia-slice-wrapper">' +
                '   <ul class="u-unstyled l-row l-row--items-3 facia-slice">{{categories}}</ul>' +
                '</div>',
            '3colRow': '<li class="l-row__item across">' +
                '   <div class="across__item">' +
                '       <h3 class="across__title"><a href="{{sectionHref}}" class="across__title__action" data-link-name="{{sectionName}} | section">{{sectionName}}</a></h3>' +
                '       <ul class="linkslist">{{stories}}' +
                '   </div>' +
                '</li>',
            '3colItem': '<li class="linkslist__item">' +
                '   <a href="{{storyHref}}" class="linkslist__action across__action" data-link-name="{{sectionName}} | story | {{storyIdx}}">' +
                '       <div class="linkslist__media-wrapper">' +
                '           <div class="linkslist__image-container u-responsive-ratio js-image-upgrade" data-src="{{story_thumb}}"></div>' +
                '       </div>' +
                '       {{storyTitle}}' +
                '   </a>' +
                '</li>',
            '2colItems': '<li class="across--columns__item">' +
                '    <a href="{{sectionHref}}" class="across__title" data-link-name="{{sectionName}} | section">{{sectionName}}</a>:' +
                '    <a href="{{storyHref}}" class="across__action" data-link-name="{{sectionName}} | story">{{storyTitle}}</a>' +
                '</li>'
        };

        function renderContainer(parseCollection) {
            ajax({
                url: edition + '/across-the-guardian/lite.json',
                type: 'json',
                crossOrigin: true
            }).then(function (sectionData) {
                $('.facia-container .container').last().after(parseCollection(sectionData));
                images.upgrade();
            });
        }

        function renderStory(collection, story, idx, tplName) {
            if (!collection || !story) {
                return '';
            }

            return template(templates[tplName], {
                sectionHref: (collection.href || ''),
                sectionName: (collection.displayName || ''),
                story_thumb: (story.thumbnail || ''),
                storyHref: '/' + (story.id || ''),
                storyIdx: idx,
                storyTitle: (story.headline || '')
            });
        }

        function render3cols(variant, storiesPerCollection) {
            if (!storiesPerCollection) {
                storiesPerCollection = 1;
            }

            return function (sectionData) {
                var tplGroupedCollections = [],
                    collections = [].concat((sectionData || {}).collections)
                    .filter(function (c) {
                        // ignore collections with no stories
                        return (!!c.content && c.content.length > 0);
                    })
                    .map(function (collection) {
                        var tplStories = collection.content
                            .slice(0, storiesPerCollection)
                            .map(function (story, idx) {
                                return renderStory(collection, story, idx, '3colItem');
                            })
                            .join(' ');

                        return template(templates['3colRow'], {
                            stories: tplStories,
                            sectionHref: '/' + (collection.href || ''),
                            sectionName: (collection.displayName || '')
                        });
                    });

                // group by 3
                while (collections.length > 0) {
                    var row = template(templates['3col'], {
                        categories: collections
                            .splice(0, 3)
                            .join(' ')});
                    tplGroupedCollections.push(row);
                }

                return template(templates.container, {
                    variant: variant,
                    containerTitle: (sectionData.webTitle || ''),
                    body: tplGroupedCollections.join(' ')
                });
            };
        }

        this.variants = [
            {
                id: 'control',
                test: function () {
                    // do nothing
                }
            },
            {
                id: '2col1story',
                test: function () {
                    var variant = '2col1story';

                    renderContainer(function (sectionData) {
                        var tplItems = [].concat((sectionData || {}).collections)
                            .filter(function (c) {
                                // ignore collections with no stories
                                return (!!c.content && c.content.length > 0);
                            })
                            .map(function (collection) {
                                if (!collection) {
                                    return '';
                                }

                                // render first item from each list
                                var story = collection.content[0];
                                return renderStory(collection, story, 0, '2colItems');
                            });

                        return template(templates.container, {
                            variant: variant,
                            containerTitle: (sectionData.webTitle || ''),
                            body: template(templates['2col'], {
                                items: tplItems.join(' ')})
                        });
                    });
                }
            },
            {
                id: '3col1story',
                test: function () {
                    renderContainer(render3cols(this.id.toLowerCase()));
                }
            },
            {
                id: '3col1storyThumb',
                test: function () {
                    renderContainer(render3cols(this.id.toLowerCase()));
                }
            },
            {
                id: '3col2stories',
                test: function () {
                    renderContainer(render3cols(this.id.toLowerCase(), 2));
                }
            }
        ];
    };

});

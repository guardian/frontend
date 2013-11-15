/*global guardian */
define([
    'qwery',
    'bonzo',
    'ajax',
    'common',
    'utils/to-array',
    'modules/detect',
    'modules/onward/history',
    'modules/relativedates'
], function (
    qwery,
    bonzo,
    ajax,
    common,
    toArray,
    detect,
    History,
    dates
) {

    var mostPopularUrl = '/onward/popular-onward/',
        container = document.querySelector('.trailblock'),
        history = new History().get().map(function(item) {
            return item.id;
        });

    function cleanUrl(url) {
        return '/' + url.split('/').slice(3).join('/');
    }

    function getTrailUrl(trail) {
        return cleanUrl(trail.querySelector('.trail__headline a').href);
    }

    function getTrails() {
        return toArray(qwery('.trail', container));
    }

    function isInHistory(trailId) {
        return history.some(function(id){
            return trailId === id;
        });
    }

    function getHeadline(trail) {
        return trail.querySelector('.trail__headline a').innerHTML;
    }

    function isQuestion(trail) {
        return getHeadline(trail).indexOf('?') > -1;
    }

    function append(trail) {
        if(typeof trail === 'string') {
            bonzo(qwery('ul:last-of-type', container)).html(trail);
        } else {
            bonzo(trail).detach().appendTo(bonzo(qwery('ul:last-of-type', container)));
        }
    }

    function prepend(trail) {
        bonzo(trail).detach().prependTo(bonzo(qwery('ul:first-of-type', container)));
    }

    function labelAsQuestion(trail) {
        trail.setAttribute('data-link-name', trail.getAttribute('data-link-name') + ' | question');
    }

    function cloneHeader()  {
        //I know... This is very dirty
        bonzo(document.getElementById('related-content-head'))
            .text('Read next')
            .clone()
            .text((document.querySelector('.more-on-this-story')) ? 'More on this story' : 'Related content')
            .insertAfter(getTrails()[0]);
    }

    function trailToHTML(id, type) {
        return ajax({
            url: '/onward/' + type + id + '.json',
            type: 'json',
            crossOrigin: true
        });
    }

    function upgradeTrail(url) {
        if(detect.getLayoutMode() === 'mobile') {
            trailToHTML(url, 'trail').then(function(resp) {
                if('html' in resp) {
                    append(resp.html);
                }
                cloneHeader();
            });
        } else {
            trailToHTML(url, 'card').then(function(resp) {
                if('html' in resp) {
                    bonzo(qwery('.card--right')).html(resp.html);
                }
            });
        }
    }

    var Question = function () {

        var self = this;

        this.id = 'StoryPackageQuestion';
        this.expiry = '2013-11-30';
        this.audience = 0.1;
        this.description = 'Test effectiveness of question based trails in storypackages';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article'){
                common.mediator.on('modules:related:loaded', function() {
                    getTrails().forEach(function(trail) {
                        if(isQuestion(trail)) {
                            labelAsQuestion(trail);
                        }
                    });
                });
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Read',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        getTrails().forEach(function(trail) {
                            if(isInHistory(getTrailUrl(trail))) {
                                append(trail);
                            }
                        });
                        upgradeTrail(getTrailUrl(getTrails()[0]));
                        dates.init(document);
                    });
                }
            },
            {
                id: 'Question',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        getTrails().forEach(function(trail) {
                            if(isQuestion(trail)) {
                                prepend(trail);
                            }
                        });
                        upgradeTrail(getTrailUrl(getTrails()[0]));
                        dates.init(document);
                    });
                }
            },
            {
                id: 'Popular',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        ajax({
                            url: mostPopularUrl + guardian.config.page.pageId + '.json',
                            type: 'json',
                            crossOrigin: true
                        }).then(
                            function(resp) {
                                if(resp && 'popularOnward' in resp) {
                                    resp.popularOnward.some(function(trail) {
                                        if(!isInHistory(trail.url)) {
                                            upgradeTrail(trail.url);
                                            dates.init(document);
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    });
                                }
                            },
                            function(req) {
                                common.mediator.emit('module:error', 'Failed to load most popular onward journey' + req, 'modules/experiments/tests/story-question.js');
                            }
                        );
                        cloneHeader();
                    });
                }
            },
            {
                id: 'control',
                test: function() {
                    return true;
                }
            }
        ];
    };

    return Question;

});

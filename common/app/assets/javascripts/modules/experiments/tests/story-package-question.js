/*global guardian */
define([
    'qwery',
    'bonzo',
    'utils/ajax',
    'common',
    'utils/to-array',
    'utils/detect',
    'modules/onward/history',
    'modules/ui/relativedates'
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
        history = new History().get().map(function(item) {
            return item.id;
        });
    
    function getContainer() {
        return  document.querySelector('.trailblock');
    }

    function cleanUrl(url) {
        return '/' + url.split('/').slice(3).join('/');
    }

    function getTrailUrl(trail) {
        return cleanUrl(trail.querySelector('.trail__headline a').href);
    }

    function getTrails() {
        return toArray(qwery('.trail', getContainer()));
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
            bonzo(qwery('ul:last-of-type', getContainer())).html(trail);
        } else {
            bonzo(trail).detach().appendTo(bonzo(qwery('ul:last-of-type', getContainer())));
        }
    }

    function prepend(trail) {
        if(typeof trail === 'string') {
            bonzo(qwery('ul:first-of-type', getContainer())).prepend(trail);
        } else {
            bonzo(trail).detach().prependTo(bonzo(qwery('ul:first-of-type', getContainer())));
        }
        return true;
    }

    function labelAs(trail, label) {
        if (trail) {
            trail.setAttribute('data-link-name', trail.getAttribute('data-link-name') + ' | ' + label);
        }
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

    function upgradeTrail(url, isQuestion) {
        var dataLink = (isQuestion) ? 'read next | is question' : 'read next';
        if(detect.getBreakpoint() === 'mobile') {
            trailToHTML(url, 'trail').then(function(resp) {
                if('html' in resp) {
                    prepend(resp.html);
                }
                cloneHeader();
                labelAs(getTrails()[0], dataLink);
            });
        } else {
            trailToHTML(url, 'card').then(function(resp) {
                if('html' in resp) {
                    bonzo(qwery('.card-wrapper--right')).removeClass('is-visible');
                    bonzo(qwery('.u-table__cell--bottom')).append(resp.html);
                    labelAs(qwery('.card-wrapper.is-visible .item__image-container')[0], dataLink);
                }
            });
        }
    }

    function dedupe(id) {
        var trails = getTrails().filter(function(trail){
            return getTrailUrl(trail) === id;
        });
        bonzo((detect.getBreakpoint() === 'mobile' && trails.length > 1) ? trails[1] : trails).hide();
    }

    var Question = function () {

        var self = this;

        this.id = 'ImproveOnwardTrails';
        this.expiry = '2013-11-30';
        this.audience = 0.25;
        this.description = 'Test effectiveness of various kinds of trails around story package';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article'){
                common.mediator.on('modules:related:loaded', function() {
                    getTrails().forEach(function(trail) {
                        if(isQuestion(trail)) {
                            labelAs(trail, 'question');
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
                        dedupe(getTrailUrl(getTrails()[0]));
                        dates.init(document);
                    });
                }
            },
            {
                id: 'Question',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        getTrails().some(function(trail) {
                            if(isQuestion(trail)){
                                prepend(trail);
                                upgradeTrail(getTrailUrl(getTrails()[0]), true);
                                dedupe(getTrailUrl(getTrails()[0]));
                                dates.init(document);
                                return true;
                            } else { return false; }
                        });
                    });
                }
            },
            {
                id: 'Popular',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        ajax({
                            url: guardian.config.page.ajaxUrl + mostPopularUrl + guardian.config.page.pageId + '.json',
                            type: 'json',
                            crossOrigin: true
                        }).then(
                            function(resp) {
                                if(resp && 'popularOnward' in resp) {
                                    resp.popularOnward.some(function(trail) {
                                        if(!isInHistory(trail.url)) {
                                            upgradeTrail(trail.url);
                                            dedupe(trail.url);
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
                    });
                }
            },
            {
                id: 'All',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {

                        if(getTrails().some(function(trail) {
                            if(isQuestion(trail)) {
                                prepend(trail);
                                return true;
                            } else { return false; }
                        }).length) {
                            upgradeTrail(getTrailUrl(getTrails()[0]), true);
                            dedupe(getTrailUrl(getTrails()[0]));
                            dates.init(document);
                            return;
                        }

                        ajax({
                            url: guardian.config.page.ajaxUrl + mostPopularUrl + guardian.config.page.pageId + '.json',
                            type: 'json',
                            crossOrigin: true
                        }).then(
                            function(resp) {
                                if(resp && 'popularOnward' in resp) {
                                    resp.popularOnward.some(function(trail) {
                                        if(!isInHistory(trail.url)) {
                                            upgradeTrail(trail.url);
                                            dedupe(trail.url);
                                            dates.init(document);
                                            return true;
                                        } else {
                                            getTrails().forEach(function(trail) {
                                                if(isInHistory(getTrailUrl(trail))) {
                                                    append(trail);
                                                }
                                            });
                                            upgradeTrail(getTrailUrl(getTrails()[0]));
                                            dedupe(getTrailUrl(getTrails()[0]));
                                            dates.init(document);
                                            return false;
                                        }
                                    });
                                }
                            },
                            function(req) {
                                common.mediator.emit('module:error', 'Failed to load most popular onward journey' + req, 'modules/experiments/tests/story-question.js');
                            }
                        );
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

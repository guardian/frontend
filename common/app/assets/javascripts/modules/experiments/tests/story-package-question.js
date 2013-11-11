define([
    'qwery',
    'bonzo',
    'utils/to-array',
    'modules/onward/history'
], function (
    qwery,
    bonzo,
    toArray,
    History
) {

    var container = document.querySelector('.trailblock'),
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
        return toArray(qwery('.trailblock li', container));
    }

    function isInHistory(trailId) {
        return history.some(function(id){
            return trailId === id;
        });
    }

    function getHeadline(trail) {
        return trail.querySelector('.trail__headline a').innerHTML;
    }

    function isQuestion(headline) {
        return (['Who', 'What', 'Where', 'Why'].some(function(word) {
            return headline.indexOf(word) === 0;
        }) || headline.indexOf('?'));
    }

    function append(trail) {
        bonzo(trail).detach().appendTo(container);
    }

    function prepend(trail) {
        bonzo(trail).detach().prependTo(container);
    }

    var Question = function () {

        var self = this;

        this.id = 'StoryPackageQuestion';
        this.expiry = '2013-11-30';
        this.audience = 0.1;
        this.description = 'Test effectiveness of question based trails in storypackages';
        this.canRun = function(config) {
            return (config.page.contentType === 'Article' && document.querySelector('.more-on-this-story'));
        };
        this.variants = [
            {
                id: 'Read',
                test: function() {
                    getTrails().forEach(function(trail) {
                        if(isInHistory(getTrailUrl(trail))) {
                            append(trail);
                        }
                    });
                    return true;
                }
            },
            {
                id: 'Question',
                test: function() {
                    getTrails().forEach(function(trail) {
                        if(isQuestion(getHeadline(trail))) {
                            prepend(trail);
                        }
                    });
                    return true;
                }
            },
            {
                id: 'Popular',
                test: function() {


                    return true;
                }
            },
            {
                id: 'All',
                test: function() {
                    self.variants.forEach(function(variant){
                        if(variant.id === 'Read' || variant.id === 'Question') {
                            variant.test.call(self);
                        }
                    });
                    return true;
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

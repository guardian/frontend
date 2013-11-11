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
        return url.replace('http://www.theguardian.com', '');
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

    function append(trail) {
        bonzo(trail).detach().appendTo(container);
    }

    var Question = function () {

        this.id = 'StoryPackageQuestion';
        this.expiry = '2013-11-30';
        this.audience = 0.1;
        this.description = 'Test effectiveness of question based trails in storypackages';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
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
                }
            },
            {
                id: 'Question',
                test: function() {

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
                id: 'control',
                test: function() {


                    return true;
                }
            }
        ];
    };

    return Question;

});

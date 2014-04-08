define([
    'common/$'
], function(
    $
) {

    var oldContainers = [
           'au/commentisfree/regular-stories',
           'au/culture/regular-stories',
           'au/business/regular-stories',
           'au/lifeandstyle/regular-stories',
           'au/technology/regular-stories',
           'au/money/regular-stories',
           'au/travel/regular-stories'
        ],

        newContainers = [
            'au-alpha/contributors/feature-stories',
            'au-alpha/people-in-the-news/feature-stories'
        ];

    function hide(ids) {
        $([].concat(ids).map(function(id) {return '.container[data-id="' + id + '"]';}).join(',')).addClass('js-hidden');
    }
    
    var hideOld = hide.bind(null, oldContainers);
    var hideNew = hide.bind(null, newContainers);
    
    return function() {
        this.id = 'BlendedContainersAu';
        this.expiry = '2014-04-18';
        this.audience = 1;
        this.audienceOffset = 0.0;
        this.description = 'Testing new blended containers on the AU network front';
        this.canRun = function() {
            return ['/au', '/au-alpha'].indexOf(window.location.pathname) === 0;
        };
        this.variants = [
            {
                id: 'control',
                test: hideNew
            },
            {
                id: 'blended-containers',
                test: hideOld
            }
        ];
        this.notInTest = hideNew;
    };
});

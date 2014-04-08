define([
    'common/$'
], function(
    $
) {

    var oldContainers = [
           'us/commentisfree/regular-stories',
           'us/culture/regular-stories',
           'us/business/regular-stories',
           'us/lifeandstyle/regular-stories',
           'us/technology/regular-stories',
           'us/money/regular-stories',
           'us/travel/regular-stories'
        ],

        newContainers = [
            'us-alpha/contributors/feature-stories',
            'us-alpha/people-in-the-news/feature-stories'
        ];

    function hide(ids) {
        $([].concat(ids).map(function(id) {return '.container[data-id="' + id + '"]';}).join(',')).addClass('js-hidden');
    }
    
    var hideOld = hide.bind(null, oldContainers);
    var hideNew = hide.bind(null, newContainers);
    
    return function() {
        this.id = 'BlendedContainersUS';
        this.expiry = '2014-04-18';
        this.audience = 1;
        this.audienceOffset = 0.0;
        this.description = 'Testing new blended containers on the US network front';
        this.canRun = function() {
            return ['/us', '/us-alpha'].indexOf(window.location.pathname) === 0;
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

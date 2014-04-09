define([
    'common/$'
], function(
    $
) {
    var oldContainers = [
           'uk/commentisfree/regular-stories',
           'uk/culture/regular-stories',
           'uk/business/regular-stories',
           'uk/lifeandstyle/regular-stories',
           'uk/technology/regular-stories',
           'uk/money/regular-stories',
           'uk/travel/regular-stories'
        ],

        newContainers = [
            'uk-alpha/contributors/feature-stories',
            'uk-alpha/people-in-the-news/feature-stories'
        ];


    function hide(ids) {
        $([].concat(ids).map(function(id) {return '.container[data-id="' + id + '"]';}).join(',')).addClass('js-hidden');
    }
    
    var hideOld = hide.bind(null, oldContainers);
    var hideNew = hide.bind(null, newContainers);
    
    return function() {
        this.id = 'BlendedContainersUk';
        this.expiry = '2014-04-18';
        this.author = 'Stephan';
        this.description = 'Final step of testing new blended containers on the UK network front';
        this.successMeasure = 'Ensuring CTR of UK network front is within 2% of control. Ensuring page views per visit are within 2% tolerance.';
        this.idealOutcome = 'CTRs and PVPV are improved with blended version.';
        this.audienceCriteria = 'All';
        this.audience = 1;
        this.audienceOffset = 0.0;
        this.canRun = function() {
            return ['/uk', '/uk-alpha'].indexOf(window.location.pathname) === 0;
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

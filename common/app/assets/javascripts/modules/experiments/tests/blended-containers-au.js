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
        this.author = 'Stephan';
        this.description = 'Final step of testing new blended containers on the AU network front';
        this.successMeasure = 'Ensuring CTR of Au network front is within 2% of control. Ensuring page views per visit are within 2% tolerance.';
        this.idealOutcome = 'CTRs and PVPV are improved with blended version.';
        this.audienceCriteria = 'All';
        this.audience = 1;
        this.audienceOffset = 0.0;

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

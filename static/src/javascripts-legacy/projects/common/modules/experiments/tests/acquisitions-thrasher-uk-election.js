define([
    'lib/$',
    'lib/element-inview',
    'lib/storage',
    'commercial/modules/user-features',
    'common/modules/commercial/contributions-utilities',
    'ophan/ng'
], function (
    $,
    elementInView,
    storage,
    userFeatures,
    contributionUtilities,
    ophan
) {

    var UK_ELECTION_THRASHER_VIEW_COUNTER = "gu.uk-election-thrasher.views";
    var UK_ELECTION_THRASHER_BLOCK_ELEMENT = "election-supporters__wrapper";

    function getThrasherViewedCount() {
        return parseInt(storage.get(UK_ELECTION_THRASHER_VIEW_COUNTER)) || 0;
    }

    function incrementThrasherViewedCount() {
        storage.set(UK_ELECTION_THRASHER_VIEW_COUNTER, getThrasherViewedCount() + 1)
    }

    var $ukElectionThrasher =  $("." + UK_ELECTION_THRASHER_BLOCK_ELEMENT);

    function isThankYouVariantReader() {
        return userFeatures.isPayingMember() || contributionUtilities.isContributor
    }

    function recordThrasherVariant() {
        // Enables the conversion rate of the ask variant to be calculated.
        ophan.record({
            component: 'uk_election_thrasher_variant',
            value: isThankYouVariantReader() ? "thank_you" : "ask"
        })
    }

    function getReaderSpecificUkElectionThrasherClass() {
        // There are eight variants of the thank you thrasher prefixed by -0, -1, -2, ..., -7
        var modifier = isThankYouVariantReader() ? "thanks-" + getThrasherViewedCount() % 8 : "ask";
        return UK_ELECTION_THRASHER_BLOCK_ELEMENT + "--" + modifier;
    }

    function onThrasherViewed(callback) {
        // Safe selecting from array - function will only be called if length of array element is positive.
        // Element in view logic taken from contribution utilities.
        elementInView($ukElectionThrasher[0], window, { top: 18 }).on('firstview', callback())
    }

    return function() {

            this.id = 'AcquisitionsThrasherUkElection';

            this.start = '2017-06-02';
            this.expiry = '2017-07-03';

            this.author = 'Guy Dawson and Joe Smith';
            this.description = 'Bootstrap the AB test framework to show a different UK election thrasher to supporters/non-supporters respectively';
            this.successMeasure = 'Conversion rate - contributions and supporter sign ups / thrasher views';
            this.idealOutcome = 'The thrasher drives acquisition';

            this.audienceCriteria = 'All';
            this.audience = 1;
            this.audienceOffset = 0;

            this.canRun = function() {
                return $ukElectionThrasher.length > 0
            };

            this.variants = [
                {
                    id: 'control',

                    test: function() {
                        $ukElectionThrasher.addClass(getReaderSpecificUkElectionThrasherClass())
                    },

                    impression: function(callback) {
                        // Fire callback on initialisation.
                        // This method is only being overridden so the thrasher variant can be recorded.
                        callback();
                        recordThrasherVariant()
                    },

                    success: function(callback) {
                        onThrasherViewed(function() {
                            callback();
                            incrementThrasherViewedCount()
                        })
                    }
                }
            ]
    }
});

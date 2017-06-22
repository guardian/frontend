define(
    [
        'lib/$',
        'lib/element-inview',
        'lib/storage',
        'commercial/modules/user-features',
        'common/modules/commercial/contributions-utilities',
        'ophan/ng',
    ],
    function(
        $,
        elementInView,
        storage,
        userFeatures,
        contributionUtilities,
        ophan
    ) {
        var UK_ELECTION_THRASHER_VIEW_COUNTER = 'gu.uk-election-thrasher.views';

        var UK_ELECTION_THRASHER_BLOCK_ELEMENT =
            'election-supporters__container';

        // Default is used for when the AB test can't be run.
        // The instance we know about is Safari in incognito mode, where local storage is not available.
        var UK_ELECTION_THRASHER_DEFAULT_CLASS_LIST =
            'election-supporters__container--ask election-supporters__container--0';

        function getThrasherViewedCount() {
            return (
                parseInt(
                    storage.local.get(UK_ELECTION_THRASHER_VIEW_COUNTER)
                ) || 0
            );
        }

        function incrementThrasherViewedCount() {
            storage.local.set(
                UK_ELECTION_THRASHER_VIEW_COUNTER,
                getThrasherViewedCount() + 1
            );
        }

        var $ukElectionThrasher = $('.' + UK_ELECTION_THRASHER_BLOCK_ELEMENT);

        function isThankYouVariantReader() {
            return (
                userFeatures.isPayingMember() ||
                contributionUtilities.isContributor
            );
        }

        function getThrasherVariant() {
            return isThankYouVariantReader() ? 'thanks' : 'ask';
        }

        function getThrasherCampaignCode() {
            return (
                'gdnwb_copts_memco_thrasher_uk_election_' + getThrasherVariant()
            );
        }

        function recordThrasherVariant() {
            // Enables the conversion rate of the ask variant to be calculated.
            ophan.record({
                component: 'uk_election_thrasher_campaign_code',
                value: getThrasherCampaignCode(),
            });
        }

        function getReaderSpecificUkElectionThrasherClassList() {
            // There are eight variants of the thank you thrasher prefixed by -0, -1, -2, ..., -7
            var viewCountClass =
                UK_ELECTION_THRASHER_BLOCK_ELEMENT +
                '--' +
                getThrasherViewedCount() % 8;
            var thrasherVariantClass =
                UK_ELECTION_THRASHER_BLOCK_ELEMENT +
                '--' +
                getThrasherVariant();
            return viewCountClass + ' ' + thrasherVariantClass;
        }

        function onThrasherViewed(thrasherElement, callback) {
            // Element in view logic taken from contribution utilities.
            elementInView(thrasherElement, window, { top: 18 }).on(
                'firstview',
                callback
            );
        }

        return function() {
            this.id = 'AcquisitionsThrasherUkElection';

            this.start = '2017-06-06';
            this.expiry = '2017-07-03';

            this.author = 'Guy Dawson and Joe Smith';
            this.description =
                'Bootstrap the AB test framework to show a different UK election thrasher to supporters/non-supporters respectively';
            this.successMeasure =
                'Conversion rate - contributions and supporter sign ups / thrasher views';
            this.idealOutcome = 'The thrasher drives acquisition';

            this.audienceCriteria = 'All';
            this.audience = 1;
            this.audienceOffset = 0;

            this.canRun = function() {
                return $ukElectionThrasher.length > 0;
            };

            this.variants = [
                {
                    id: 'control',

                    test: function() {
                        $ukElectionThrasher.removeClass(
                            UK_ELECTION_THRASHER_DEFAULT_CLASS_LIST
                        );
                        $ukElectionThrasher.addClass(
                            getReaderSpecificUkElectionThrasherClassList()
                        );
                    },

                    impression: function(callback) {
                        // Fire callback on initialisation.
                        // This method is only being overridden so the thrasher variant can be recorded.
                        callback();
                        recordThrasherVariant();
                    },

                    success: function(callback) {
                        // Check the thrasher is on the page as the success function is still fired,
                        // even if the test can't be run.
                        if ($ukElectionThrasher.length > 0) {
                            onThrasherViewed(
                                $ukElectionThrasher[0],
                                function() {
                                    callback();
                                    incrementThrasherViewedCount();
                                }
                            );
                        }
                    },
                },
            ];
        };
    }
);

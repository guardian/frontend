define([
    'common',
    'modules/detect',
    'modules/experiments/right-hand-card'
],
    function (
        common,
        detect,
        Card
        ) {

        var RightHandCard = function () {

            this.id = 'RightHandCard';
            this.expiry = '2013-08-28';
            this.audience = 1;
            this.description = 'Introduce next story into card in right hand column and test impact';
            this.canRun = function(config) {
                var layoutMode = detect.getLayoutMode();
                return config.page.contentType === 'Article' && layoutMode !== 'mobile' && layoutMode !== 'tablet';
            };
            this.variants = [
                {
                    id: 'control',
                    test: function () {
                        document.querySelector('.card-wrapper--right').className += ' is-hidden';
                    }
                },
                {
                    id: 'story-package-card',
                    test: function () {
                        var card = new Card({
                            type: 'story-package'
                        });
                    }
                },
                {
                    id: 'most-read-card',
                    test: function () {
                        var card = new Card({
                            type: 'most-read'
                        });
                    }
                },
                {
                    id: 'latest-card',
                    test: function () {
                        var card = new Card({
                            type: 'latest'
                        });
                    }
                }
            ];
        };

        return RightHandCard;

    });

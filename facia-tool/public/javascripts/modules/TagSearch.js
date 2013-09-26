define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    return {

        init: function(opts) {

            // dependency injection
            var opts = opts || {}
            var config  = opts.config  || Config;
            var common  = opts.common  || Common;
            var reqwest = opts.reqwest || Reqwest;
            var apiEndPoint = opts.apiEndPoint || 'http://content.guardianapis.com/tags';

            Common.mediator.addListener('modules:oncomplete', function (inputElement) {

                reqwest(
                    {
                        url: apiEndPoint + "?q=" + encodeURIComponent(inputElement.value) + "&format=json&page-size=50&api-key=" + config.apiKey,
                        type: 'jsonp',
                        success: function (json) {
                           Common.mediator.emitEvent('modules:tagsearch:success', [json.response, inputElement])
                        }
                    }
                )

            });

        }
    }

});


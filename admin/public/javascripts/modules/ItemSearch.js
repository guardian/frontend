define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    var reqwest = Reqwest
      , apiEndPoint = 'http://content.guardianapis.com/'
      , key = Config.apiKey
      , search = function(response, tagInputElement) {
            reqwest({
                url: apiEndPoint + $(tagInputElement).val() + "?format=json&page-size=1&api-key=" + key,
                type: 'jsonp',
                success: function (json) {
                    Common.mediator.emitEvent('modules:itemsearch:success', [json.response, tagInputElement])
                }
            })
        }
      , validateTag = function(response, tagInputElement) {
            if (response.hasOwnProperty('tag')) {
                Common.mediator.emitEvent('modules:tagvalidation:success', [tagInputElement, response.tag]);
            } else {
                Common.mediator.emitEvent('modules:tagvalidation:failure', [tagInputElement]);
            }
        }
      , init = function(opts) {
            var opts = opts || {};
            reqwest = opts.reqwest || Reqwest;
            apiEndPoint = opts.apiEndPoint || 'http://content.guardianapis.com/';

            Common.mediator.addListener('modules:tagsearch:success', search);
            Common.mediator.addListener('ui:networkfronttool:tagid:selected', search);
            Common.mediator.addListener('modules:autocomplete:selected', search);
            Common.mediator.addListener('modules:itemsearch:success', validateTag);
      } 

    return {
        search: search,
        validateTag: validateTag,
        init: init
    };

});


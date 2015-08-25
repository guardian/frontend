import _ from 'underscore';
import mockjax from 'test/utils/mockjax';
import Promise from 'Promise';

export default function(mockConfig, baseModel, action) {

    return new Promise(function (resolve) {
        var lastRequest, desiredAnswer;
        var interceptFront = mockjax({
            url: '/config/fronts',
            type: 'post',
            response: function (request) {
                lastRequest = request;
                lastRequest.data = JSON.parse(request.data);
                this.responseText = desiredAnswer;
            },
            onAfterComplete: function () {
                clearRequest();
                baseModel.once('config:needs:update', callback => {
                    callback(_.extend({}, baseModel.state(),
                        { config: {
                            fronts: _.extend({}, baseModel.state().config.fronts, desiredAnswer.fronts),
                            collections: _.extend({}, baseModel.state().config.collections, desiredAnswer.collections)
                        }
                    }));
                    resolve(lastRequest);
                });
            }
        });
        var interceptEdit = mockjax({
            url: /config\/fronts\/(.+)/,
            urlParams: ['front'],
            type: 'post',
            response: function (request) {
                lastRequest = request;
                lastRequest.data = JSON.parse(request.data);
                lastRequest.front = request.urlParams.front;
                this.responseText = desiredAnswer;
            },
            onAfterComplete: function () {
                clearRequest();
                // Every such action is also triggering an update of the config
                baseModel.once('config:needs:update', callback => {
                    callback(_.extend({}, baseModel.state(),
                        { config: {
                            fronts: _.extend({}, baseModel.state().config.fronts, desiredAnswer.fronts),
                            collections: _.extend({}, baseModel.state().config.collections, desiredAnswer.collections)
                        }
                    }));
                    resolve(lastRequest);
                });
            }
        });

        function clearRequest () {
            mockjax.clear(interceptFront);
            mockjax.clear(interceptEdit);
        }

        desiredAnswer = action();
        mockConfig.update(desiredAnswer);
    });
}

import mockjax from 'test/utils/mockjax';
import Promise from 'Promise';
import persistence from 'models/config/persistence';

export default function(mockConfig, action) {

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
                // Every such action is also triggering an update of the config
                persistence.once('after update', () => {
                    setTimeout(() => {
                        resolve(lastRequest);
                    }, 100);
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
                persistence.once('after update', () => {
                    setTimeout(() => {
                        resolve(lastRequest);
                    }, 100);
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

import mockjax from 'test/utils/mockjax';
import Promise from 'Promise';

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
                jasmine.clock().tick(100);
                resolve(lastRequest);
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
                jasmine.clock().tick(100);
                resolve(lastRequest);
            }
        });

        function clearRequest () {
            mockjax.clear(interceptFront);
            mockjax.clear(interceptEdit);
        }

        desiredAnswer = action();
        mockConfig.update(desiredAnswer);

        // This action triggers a network request, advance time
        jasmine.clock().tick(100);
    });
}

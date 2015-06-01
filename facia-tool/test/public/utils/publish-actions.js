import Promise from 'Promise';
import mockjax from 'test/utils/mockjax';

export default function(action) {
    return new Promise(function (resolve) {
        var publishedCollection;
        var publishInterceptor = mockjax({
            url: /collection\/publish\/(.+)/,
            urlParams: ['collection'],
            type: 'post',
            responseText: '',
            response: function (request) {
                publishedCollection = request.urlParams.collection;
            },
            onAfterComplete: function () {
                mockjax.clear(publishInterceptor);
                resolve(publishedCollection);
            }
        });
        action();
        jasmine.clock().tick(100);
    });
}

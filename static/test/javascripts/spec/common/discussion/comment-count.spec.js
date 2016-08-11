define([
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/discussion/comment-count'
], function (
    $,
    mediator,
    commentCountWidget
) {
    describe('Comment counts', function () {

        var fixtureTrails = [
            '<div class="comment-trails">',
                '<a><comment-count discussion="/p/3ghv5" closed></comment-count></a>',
                '<a><comment-count discussion="/p/3ghx3" closed></comment-count></a>',
                '<a><comment-count discussion="/p/3gh4n"></comment-count></a>',
            '</div>'
        ].join('');

        var mockFetch = function () {
            return Promise.resolve({
                ok: true,
                json: function () {
                    return {
                        counts: [
                            { id: '/p/3ghv5', count: 0 },
                            { id: '/p/3ghx3', count: 10 },
                            { id: '/p/3gh4n', count: 1000 },
                            { id: '/p/3gh7b', count: 300 }
                        ]
                    };
                }
            });
        };

        beforeEach(function () {
            $('body').append(fixtureTrails);
        });

        afterEach(function () {
            $('.comment-trails').remove();
        });

        it('removes closed discussions with zero comment count, keeping the others', function (done) {
            commentCountWidget.init({ fetch: mockFetch })
            .then(function () {
                expect($('[discussion="/p/3ghv5"]')[0]).toBeUndefined();
                expect($('[discussion="/p/3ghx3"]')[0].innerText).toBe('10');
                expect($('[discussion="/p/3gh4n"]')[0].innerText).toBe('1,000');
            })
            .then(done)
            .catch(done.error);
        });

        it('update the count after emitting an event', function (done) {
            commentCountWidget.init({ fetch: mockFetch })
            .then(function () {
                $('.comment-trails').append('<a><comment-count discussion="/p/3gh7b"></comment-count></a>');

                return new Promise(function (resolve, reject) {
                    mediator.on('modules:commentcount:loaded', resolve);
                    setTimeout(reject, 1000);
                    mediator.emit('modules:related:loaded');
                });
            })
            .then(function () {
                expect($('[discussion="/p/3gh7b"]')[0].innerText).toBe('300');
            })
            .then(done)
            .catch(done.error);
        });
    });
});

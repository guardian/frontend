define([
    'test/utils/async-it',
    'test/utils/drag',
    'mock-collection',
    'test/utils/edit-actions'
], function(
    it,
    drag,
    mockCollection,
    editAction
){
    describe('Collections', function () {
        it('displays the correct timing', function (done) {
            expect(
                $('.list-header__timings').text().replace(/\s+/g, ' ')
            ).toMatch('1 day ago by Test');
            done();
        });

        it('adds items', function (done) {
            // The first article from the latest
            var firstArticle = document.querySelector('.latest-articles .article');
            var secondArticle = document.querySelector('.latest-articles .article:nth-child(2)');
            var thirdArticle = document.querySelector('.latest-articles .article:nth-child(3)');
            // The first group in the second collection
            var firstGroup = document.querySelector('.collection:nth-child(2) .droppable');

            editAction(function () {
                drag.drop(firstGroup, new drag.Article(firstArticle));

                return {
                    sport: {
                        live: [{
                            id: 'internal/one',
                            webPublicationDate: (new Date()).toISOString(),
                            meta: {
                                group: 3
                            }
                        }]
                    }
                };
            }).then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('sport');
                expect(request.data.update.item).toEqual('internal-code/content/1');
                expect(request.data.update.itemMeta.group).toEqual('3');
                done();
            });

        });
    });
});

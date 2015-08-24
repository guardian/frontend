import $ from 'jquery';
import Promise from 'Promise';
import {CONST} from 'modules/vars';
import MockVisible from 'mock/stories-visible';
import CollectionsLoader from 'test/utils/collections-loader';
import drag from 'test/utils/drag';
import editAction from 'test/utils/edit-actions';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

describe('Media Service', function () {
    beforeEach(function (done) {
        this.originalCDNDomain = CONST.imageCdnDomain;
        CONST.imageCdnDomain = window.location.host;
        this.testInstance = new CollectionsLoader();
        this.mockVisible = new MockVisible();
        this.testInstance.load().then(done);
    });
    afterEach(function () {
        CONST.imageCdnDomain = this.originalCDNDomain;
        this.testInstance.dispose();
        this.mockVisible.dispose();
    });

    it('drags an image from the grid', function (done) {
        var mockCollection = this.testInstance.mockCollections;

        openArticle()
        .then(expectArticleOpen)
        .then(dragFromTheGrid)
        .then(expectImageChange)
        .then(openCutoutImageEditor)
        .then(dragCutoutFromGrid)
        .then(expectCutoutChange)
        .then(openImageReplaceEditor)
        .then(dragInvalidImage)
        .then(expectAlertShown)
        .then(closeAlert)
        .then(saveArticle)
        .then(expectChangesSaved)
        .then(done)
        .catch(done.fail);

        function openArticle () {
            $('collection-widget .element__headline').click();
            return Promise.resolve();
        }
        function expectArticleOpen () {
            expect($('.tool--done').is(':visible')).toBe(true);
        }
        function dragFromTheGrid () {
            var droppableRegionInsideArticle = $('collection-widget trail-widget .droppable')[0];
            var dropTarget = drag.droppable(droppableRegionInsideArticle);
            var sourceImage = new drag.Media([{
                file: 'http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/fivethree.png',
                dimensions: { width: 500, height: 200 }
            }], 'testImageOrigin');
            dropTarget.dragover(droppableRegionInsideArticle, sourceImage);
            dropTarget.drop(droppableRegionInsideArticle, sourceImage);
            return wait.ms(300);
        }
        function expectImageChange () {
            expect($('collection-widget trail-widget .thumb').css('background-image')).toMatch(/fivethree\.png/);
            expect($('collection-widget trail-widget .editor--boolean--imageReplace').hasClass('selected')).toBe(true);
        }
        function openCutoutImageEditor () {
            $('collection-widget trail-widget .editor--boolean--imageCutoutReplace').click();
            expect($('collection-widget trail-widget .editor--boolean--imageReplace').hasClass('selected')).toBe(false);
            expect($('collection-widget trail-widget .editor--boolean--imageCutoutReplace').hasClass('selected')).toBe(true);
        }
        function dragCutoutFromGrid () {
            var droppableEditor = $('collection-widget trail-widget .element__imageCutoutSrc')[0];
            var dropTarget = drag.droppable(droppableEditor);
            var sourceImage = new drag.Media([{
                file: 'http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/squarefour.png',
                dimensions: { width: 400, height: 400 }
            }], 'cutoutImageOrigin');
            dropTarget.dropInEditor(droppableEditor, sourceImage);
            return wait.ms(300);
        }
        function expectCutoutChange () {
            expect($('collection-widget trail-widget .thumb').css('background-image')).toMatch(/squarefour\.png/);
            expect($('collection-widget trail-widget .editor--boolean--imageCutoutReplace').hasClass('selected')).toBe(true);
        }
        function openImageReplaceEditor () {
            $('collection-widget trail-widget .editor--boolean--imageReplace').click();
        }
        function dragInvalidImage () {
            var droppableEditor = $('collection-widget trail-widget .element__imageSrc')[0];
            var dropTarget = drag.droppable(droppableEditor);
            var sourceImage = new drag.Media([{
                file: 'This image is too big',
                dimensions: { width: 2000, height: 1600 }
            }], 'tooBig');
            dropTarget.dropInEditor(droppableEditor, sourceImage);
            return wait.ms(100);
        }
        function expectAlertShown () {
            expect($('.modalDialog-message').is(':visible')).toBe(true);
            expect(textInside('.modalDialog-message')).toMatch(/suitable crop/i);
        }
        function closeAlert () {
            $('.modalDialog .button-action').click();
        }
        function saveArticle () {
            return editAction(mockCollection, () => {
                $('collection-widget trail-widget .tool--done').click();

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/1',
                            meta: {
                                imageReplace: true,
                                imageSrc: 'something dragged from media'
                            }
                        }]
                    }
                };
            });
        }
        function expectChangesSaved (request) {
            expect(request.url).toBe('/edits');
            expect(request.data).toEqual({
                type: 'Update',
                update: {
                    live: false,
                    draft: true,
                    id: 'latest',
                    item: 'internal-code/page/1',
                    position: 'internal-code/page/1',
                    itemMeta: {
                        group: '0',
                        imageCutoutSrc: 'http://localhost:9876/base/test/public/fixtures/squarefour.png',
                        imageCutoutSrcHeight: '400',
                        imageCutoutSrcWidth: '400',
                        imageReplace: true,
                        imageSrc: 'http://localhost:9876/base/test/public/fixtures/fivethree.png',
                        imageSrcHeight: '300',
                        imageSrcWidth: '500'
                    }
                }
            });
        }
    });
});

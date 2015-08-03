import media from 'utils/get-media-main-image';
import * as vars from 'modules/vars';

describe('Media main image', function () {
    beforeEach(function () {
        this.originalmediaBaseImage = vars.pageConfig.mediaBaseUrl;
        vars.pageConfig.mediaBaseUrl = 'media'
    });
    afterEach(function () {
        vars.pageConfig.mediaBaseUrl = this.originalmediaBaseImage;
    });

    it('extract the main image', function () {
        expect(media({
            missingBlocks: {}
        })).toBeUndefined();

        expect(media({
            blocks: {
                main: {
                    elements: []
                }
            }
        })).toBeUndefined();

        expect(media({
            blocks: {
                main: {
                    elements: [{
                        imageTypeData: {
                            mediaId: 'not in media service'
                        },
                        type: 'image'
                    }]
                }
            }
        })).toBeUndefined();

        expect(media({
            blocks: {
                main: {
                    elements: [{
                        imageTypeData: {
                            mediaId: 'inside-media-service',
                            mediaApiUri: 'anywhere'
                        },
                        type: 'not an image'
                    }]
                }
            }
        })).toBeUndefined();

        expect(media({
            blocks: {
                main: {
                    elements: [{
                        imageTypeData: {
                            mediaId: 'inside-media-service',
                            mediaApiUri: 'anywhere'
                        },
                        type: 'image'
                    }]
                }
            }
        })).toBe('media/images/inside-media-service');
    });
});

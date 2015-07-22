import {CONST} from 'modules/vars';
import validate from 'utils/validate-image-src';

describe('Validate images', function () {
    beforeEach(function () {
        this.originalCDNDomain = CONST.imageCdnDomain;
    });
    afterEach(function () {
        CONST.imageCdnDomain = this.originalCDNDomain;
    });

    it('fails on missing images', function (done) {
        validate()
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/missing/i);
            done();
        });
    });

    it('fails on wrong domain', function (done) {
        CONST.imageCdnDomain = 'funny-host';

        validate('http://another-host/image.png')
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/images must come/i);
            done();
        });
    });

    it('fails if the image can\'t be found', function (done) {
        CONST.imageCdnDomain = window.location.host;

        validate('http://' + CONST.imageCdnDomain + '/this_image_doesnt_exists__promised.png')
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/could not be found/i);
            done();
        });
    });

    it('fails if the image is too big', function (done) {
        CONST.imageCdnDomain = window.location.host;
        var criteria = {
            maxWidth: 50
        };

        validate('http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/square.png', criteria)
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/cannot be more/i);
            done();
        });
    });

    it('fails if the image is too small', function (done) {
        CONST.imageCdnDomain = window.location.host;
        var criteria = {
            minWidth: 200
        };

        validate('http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/square.png', criteria)
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/cannot be less/i);
            done();
        });
    });

    it('fails if the aspect ratio is wrong', function (done) {
        CONST.imageCdnDomain = window.location.host;
        var criteria = {
            widthAspectRatio: 5,
            heightAspectRatio: 3
        };

        validate('http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/square.png', criteria)
        .then(done.fail, function (err) {
            expect(err.message).toMatch(/aspect ratio/i);
            done();
        });
    });

    it('works with no criteria', function (done) {
        CONST.imageCdnDomain = window.location.host;

        validate('http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/square.png')
        .then(function (image) {
            expect(image.width).toBe(140);
            expect(image.height).toBe(140);
            expect(image.src).toMatch(/square\.png/);
            done();
        }, done.fail);
    });

    it('works with if all criteria are met', function (done) {
        CONST.imageCdnDomain = window.location.host;
        var criteria = {
            minWidth: 100,
            maxWidth: 200,
            widthAspectRatio: 1,
            heightAspectRatio: 1
        };

        validate('http://' + CONST.imageCdnDomain + '/base/test/public/fixtures/square.png', criteria)
        .then(function (image) {
            expect(image.width).toBe(140);
            expect(image.height).toBe(140);
            expect(image.src).toMatch(/square\.png/);
            done();
        }, done.fail);
    });

    it('strips unnecessary parameters', function (done) {
        CONST.imageCdnDomain = window.location.host;

        validate('http://' + CONST.imageCdnDomain + CONST.imgIXBasePath +
            'base/test/public/fixtures/square.png?s=82a57a91afadd159bb4639d6b798f6c5&other=params')
        .then(function (image) {
            expect(image.width).toBe(140);
            expect(image.height).toBe(140);
            expect(image.src).toMatch(/square\.png$/);
            done();
        }, done.fail);
    });
});

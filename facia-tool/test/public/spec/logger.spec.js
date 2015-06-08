import logger from 'utils/logger';

describe('Logger', function () {
    var raven = {
        captureException: function () {}
    };
    var cnsl = {
        log: function () {},
        error: function () {}
    };

    beforeEach(function () {
        spyOn(raven, 'captureException');
        spyOn(cnsl, 'log');
        spyOn(cnsl, 'error');

        logger.console = cnsl;
        logger.Raven = raven;
    });

    it('logs a message', function () {
        logger.log('message');
        expect(cnsl.log).toHaveBeenCalledWith('message');
        expect(raven.captureException).not.toHaveBeenCalled();
    });

    it('logs an error', function () {
        logger.error('error');
        expect(cnsl.log).not.toHaveBeenCalled();
        expect(cnsl.error).toHaveBeenCalledWith('error');
        expect(raven.captureException).toHaveBeenCalled();
    });
});

import debounce from 'utils/debounce';
import tick from 'test/utils/tick';

describe('Debounce', function () {
    beforeEach(function () {
        jasmine.clock().install();
    });
    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it('waits and calls the last bounced method', function (done) {
        var countPromises = 0,
            countCalls = 0,
            inProgress = false,
            bounced = debounce(() => {
                return new Promise(resolve => {
                    countCalls += 1;
                    setTimeout(function () {
                        inProgress = true;
                        resolve('value');
                    }, 1000);
                });
            }, 200),
            fn = () => {
                bounced().then(res => {
                    inProgress = false;
                    countPromises += 1;
                    expect(res).toBe('value');
                });
            };

        fn();
        expect(countPromises).toBe(0);
        expect(countCalls).toBe(0);
        expect(inProgress).toBe(false);
        fn();
        expect(countPromises).toBe(0);
        expect(countCalls).toBe(0);
        expect(inProgress).toBe(false);

        tick(100).then(() => {
            expect(countPromises).toBe(0);
            expect(countCalls).toBe(0);
            expect(inProgress).toBe(false);
            fn();

            return tick(120);
        }).then(() => {
            // the other callbacks are debounced
            expect(countPromises).toBe(0);
            expect(countCalls).toBe(0);
            expect(inProgress).toBe(false);

            // enough time for the callback to be called
            return tick(200);
        }).then(() => {
            expect(countPromises).toBe(0);
            expect(countCalls).toBe(1);
            expect(inProgress).toBe(false);

            // the subsequent calls should abort the previous
            fn();
            fn();
            return tick(1000);
        }).then(() => {
            expect(countPromises).toBe(0);
            expect(countCalls).toBe(2);
            expect(inProgress).toBe(true);

            // give time to the last bounced request to complete
            return tick(200);
        }).then(() => {
            expect(countPromises).toBe(1);
            expect(countCalls).toBe(2);
            expect(inProgress).toBe(false);
        })
        .then(done)
        .catch(done.fail);
    });

    it('debounces on rejected failures', function (done) {
        var counter = 0, inProgress = false,
            bounced = debounce(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(function () {
                        inProgress = true;
                        reject('value');
                    }, 1000);
                });
            }, 200),
            fn = () => {
                bounced().then(done.fail, res => {
                    inProgress = false;
                    counter += 1;
                    expect(res).toBe('value');
                });
            };

        fn();
        expect(counter).toBe(0);
        expect(inProgress).toBe(false);
        fn();
        expect(counter).toBe(0);
        expect(inProgress).toBe(false);

        tick(100).then(() => {
            expect(counter).toBe(0);
            expect(inProgress).toBe(false);
            fn();

            return tick(120);
        }).then(() => {
            // the other callbacks are debounced
            expect(counter).toBe(0);
            expect(inProgress).toBe(false);

            // enough time for the callback to be called
            return tick(200);
        }).then(() => {
            expect(counter).toBe(0);
            expect(inProgress).toBe(false);

            // the subsequent calls should abort the previous
            fn();
            fn();
            return tick(1000);
        }).then(() => {
            expect(counter).toBe(0);
            expect(inProgress).toBe(true);

            // give time to the last bounced request to complete
            return tick(200);
        }).then(() => {
            expect(counter).toBe(1);
            expect(inProgress).toBe(false);
        })
        .then(done)
        .catch(done.fail);
    });

    it('handles parameters', function (done) {
        var called = false,
            bounced = debounce((input, string) => {
                return new Promise(resolve => {
                    setTimeout(function () {
                        resolve({
                            num: input + 1,
                            string
                        });
                    }, 1000);
                });
            }, 200);

        bounced(1).then(done.fail);
        bounced(2).then(done.fail);
        bounced(3, 'long').then((res) => {
            expect(res).toEqual({
                num: 4,
                string: 'long'
            });
            called = true;
        });

        tick(200).then(() => tick(1000))
        .then(() => {
            expect(called).toBe(true);
        })
        .then(done)
        .catch(done.fail);
    });

    it('dispose debounce', function (done) {
        var called = false,
            bounced = debounce(() => {
                called = true;
                return new Promise(resolve => {
                    setTimeout(function () {
                        resolve();
                    }, 1000);
                });
            }, 200);

        bounced().then(done.fail);
        bounced().then(done.fail);
        bounced().then(done.fail);
        jasmine.clock().tick(100);
        bounced.dispose();

        tick(200).then(() => {
            expect(called).toBe(false);
        })
        .then(done)
        .catch(done.fail);
    });
});

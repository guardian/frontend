define([
    'bootstraps/enhanced/accessibility',
    'common/modules/accessibility/main',
    'common/modules/accessibility/helpers',
    'lib/storage',
    'qwery',
    'bonzo'
], function (
    bootstrap,
    accessibility,
    helpers,
    storage,
    qwery,
    bonzo
) {
    describe('Accessibility', function () {
        beforeEach(function () {
            document.body.innerHTML += '<div id="' + bootstrap.DOM_ID + '"></div>';
            this.DOM = document.getElementById(bootstrap.DOM_ID);
        });
        afterEach(function () {
            this.DOM.parentNode.removeChild(this.DOM);
        });

        var originalSaveState = accessibility.saveState;
        function installSpy() {
            var onSaveCallback;
            spyOn(accessibility, 'saveState').and.callFake(function () {
                setTimeout(onSaveCallback, 10);
                return originalSaveState.apply(accessibility, arguments);
            });

            return function (fn, callback) {
                onSaveCallback = callback;
                fn();
            };
        }

        function storedValue() {
            return storage.local.get('gu.prefs.' + accessibility.KEY_PREFIX + '.flashing-elements');
        }

        it('toggles from unknown', function (done) {
            window.localStorage.clear();

            var run = installSpy();
            bootstrap.init(function () {
                var checkbox = bonzo(qwery('input[data-link-name=flashing-elements]'));
                expect(checkbox.attr('checked')).toBe(true);
                expect(accessibility.isOn('flashing-elements')).toBe(true);

                run(function () {
                    checkbox[0].click();
                }, function () {
                    expect(checkbox.attr('checked')).toBe(false);
                    expect(storedValue()).toBe(false);
                    expect(accessibility.isOn('flashing-elements')).toBe(false);

                    // toggle again
                    run(function () {
                        checkbox[0].click();
                    }, function () {
                        expect(checkbox.attr('checked')).toBe(true);
                        expect(storedValue()).toBe(true);
                        expect(accessibility.isOn('flashing-elements')).toBe(true);

                        done();
                    });
                });
            });
        });

        it('initializes to known value', function (done) {
            window.localStorage.clear();
            storage.local.set('gu.prefs.' + accessibility.KEY_PREFIX + '.flashing-elements', false);

            var run = installSpy();
            bootstrap.init(function () {
                var checkbox = bonzo(qwery('input[data-link-name=flashing-elements]'));
                expect(checkbox.attr('checked')).toBe(false);
                expect(accessibility.isOn('flashing-elements')).toBe(false);

                run(function () {
                    checkbox[0].click();
                }, function () {
                    expect(checkbox.attr('checked')).toBe(true);
                    expect(storedValue()).toBe(true);
                    expect(accessibility.isOn('flashing-elements')).toBe(true);

                    done();
                });
            });
        });
    });

});

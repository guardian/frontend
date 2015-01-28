define([
    'helpers/injector'
], function(
    Injector
) {

    var config = {
        images: {
            commercial: { }
        }
    };

    return new Injector()
        .mock({
            'common/utils/config': config
        })
        .require(['common/modules/commercial/creatives/branded-component'], function (BrandedComponent) {

            describe('Branded Component', function() {

                it('should exist', function() {
                    expect(BrandedComponent).toBeDefined();
                });

            });

        });

});


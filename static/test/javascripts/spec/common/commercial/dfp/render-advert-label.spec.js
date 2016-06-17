define([
    'bonzo',
    'common/modules/commercial/dfp/render-advert-label'
], function (
    bonzo,
    renderAdvertLabel
) {
    describe('Rendering advert labels', function () {

        var adverts = {};
        var labelSelector = '.ad-slot__label';

        beforeEach(function () {
            adverts.withLabel = bonzo(bonzo.create(
                '<div class="js-ad-slot"></div>'
            ));

            adverts.labelDisabled = bonzo(bonzo.create(
                '<div class="js-ad-slot" data-label="false"></div>'
            ));

            adverts.alreadyLabelled = bonzo(bonzo.create(
                '<div class="js-ad-slot">' +
                    '<div class="ad-slot__label">Advertisement</div>' +
                '</div>'
            ));

            adverts.guStyle = bonzo(bonzo.create(
                '<div class="js-ad-slot gu-style"></div>'
            ));

            adverts.frame = bonzo(bonzo.create(
                '<div class="js-ad-slot ad-slot--frame"></div>'
            ));
        });

        it('Can add a label', function (done) {
            renderAdvertLabel(adverts.withLabel).then(function () {
                var label = adverts.withLabel[0].querySelector(labelSelector);
                expect(label).not.toBe(null);
                done();
            });
        });

        it('The label has a message', function (done) {
            renderAdvertLabel(adverts.withLabel).then(function () {
                var label = adverts.withLabel[0].querySelector(labelSelector);
                expect(label.textContent).toBe('Advertisement');
                done();
            });
        });

        it('Won`t add a label if it has an attribute data-label=`false`', function (done) {
            renderAdvertLabel(adverts.labelDisabled).then(function () {
                var label = adverts.withLabel[0].querySelector(labelSelector);
                expect(label).toBe(null);
                done();
            });
        });

        it('Won`t add a label if the adSlot already has one', function (done) {
            renderAdvertLabel(adverts.alreadyLabelled).then(function () {
                var label = adverts.withLabel[0].querySelector(labelSelector);
                expect(label).toBe(null);
                done();
            });
        });

        it('Won`t add a label to guStyle ads', function (done) {
            renderAdvertLabel(adverts.guStyle).then(function () {
                var label = adverts.withLabel[0].querySelector(labelSelector);
                expect(label).toBe(null);
                done();
            });
        });

        it('Won`t add a label to frame ads', function (done) {
            renderAdvertLabel(adverts.frame).then(function () {
                var label = adverts.withLabel[0].querySelector(labelSelector);
                expect(label).toBe(null);
                done();
            });
        });
    });
});

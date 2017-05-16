define([
    'helpers/injector',
    'helpers/fixtures',
], function (
    Injector,
    fixtures
) {
    describe('Tech-feedback', function () {

        var injector = new Injector();
        var TechFeedback;

        var fixturesConfig = {
            id: 'related',
            fixtures: [
                '<p id="feedback-warning"></p>',
                '<select id="feedback-category"></select>',
                '<div id="feedback-form-default"></div>'
            ]
        };

        beforeEach(function(done) {
           injector.require(['common/modules/onward/tech-feedback'], function(TechFeedbackModule) {
               TechFeedback = TechFeedbackModule;
               fixtures.render(fixturesConfig);
               done();
           })
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it("Should return a browser in extra information", function(){
            var feedback = new TechFeedback();
            expect(feedback.getExtraDataInformation().browser).toBeDefined();
        });

        it("Should recognise a lack of AB tests", function(){
            var feedback = new TechFeedback();
            expect(feedback.getExtraDataInformation().abTests).toBe("No tests running");
        });

        it("Should be able to summarise AB tests if they exist", function(){
            var feedback = new TechFeedback();
            expect(feedback.summariseAbTests({Foo : {variant : 'foo'}, Bar : {variant : 'bar'}})).toBe('Foo=foo, Bar=bar');
        });

        it("Should hide the unenhanced form", function(){
            new TechFeedback();
            expect(document.getElementById("feedback-form-default")).toBeNull();
        });

    });
});

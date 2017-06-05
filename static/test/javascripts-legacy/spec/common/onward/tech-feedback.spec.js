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
                '<form id="feedback__form"><select id="feedback-category"><option id="testoption" value="feedback-form-website">Website</option></select><input name="extra" value=""></form>',
                '<div id="feedback-form-default"></div>',
                '<div id="feedback-form-website"></div>'
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

        it("Should place the extra information into the form", function(){
            new TechFeedback();
            expect(document.querySelectorAll("#feedback__form input[name=extra]")[0].value).toContain("browser");
        });

        it("Should start off with the inputs disabled", function(){
            new TechFeedback();
            expect(document.querySelectorAll("#feedback__form input[name=extra]")[0].disabled).toBeTruthy();
        });

        it("Should enable inputs after we choose something from the category select", function() {
            new TechFeedback();
            document.getElementById("testoption").setAttribute('selected', 'selected');
            document.getElementById("feedback-category").value = "feedback-form-website";
            document.getElementById("feedback-category").dispatchEvent(new Event('change'));
            expect(document.querySelectorAll("#feedback__form input[name=extra]")[0].disabled).toBeFalsy();
        })

    });
});

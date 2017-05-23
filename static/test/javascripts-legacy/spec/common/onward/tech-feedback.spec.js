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
                '<select id="feedback-category"><option id="testoption" value="feedback-form-website">Website</option></select>',
                '<div id="feedback-form-default"></div>',
                '<div id="feedback-form-website"></div>',
                '<div class="feedback__form"><input name="extra"/></div>'
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

        it("Should place the extra information into the forms", function(){
            new TechFeedback();
            expect(document.querySelectorAll(".feedback__form input[name=extra]")[0].value).toContain("browser");
            expect(document.querySelectorAll(".feedback__form input[name=extra]")[0].value).toContain("No tests running");
        });

        it("Should hide the un-enhanced form", function(){
            new TechFeedback();
            expect(document.getElementById("feedback-form-default")).toBeNull();
        });

        it("Should flip to the correct form after we choose something from the dropdown", function() {
            new TechFeedback();
            document.getElementById("testoption").setAttribute('selected', 'selected');
            document.getElementById("feedback-category").value = "feedback-form-website";
            document.getElementById("feedback-category").dispatchEvent(new Event('change'));
            expect(document.getElementById("feedback-form-website").classList).toContain("feedback__form--selected")
        })

    });
});

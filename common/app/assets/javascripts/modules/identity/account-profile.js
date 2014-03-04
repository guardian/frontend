define([
    'bean',
    'bonzo'
], function(
    bean,
    bonzo
) {
    return (function () {

        var self = this;

        var onInputChange = function (event) {
            bonzo(event.target.form).addClass("changed");
        };

        var bindInputs = function (form) {
            var inputs = Array.prototype.slice.call(form.querySelectorAll(".text-input"));
            for (var i = inputs.length - 1; i >= 0; i--) {
                inputs[i].form = form;
                inputs[i].addEventListener("change", onInputChange);
            }
        };

        return {
            init: function (context) {

                var accountProfileForms = context.querySelector(".js-account-profile-forms");

                if (accountProfileForms) {
                    bindInputs(accountProfileForms.querySelector('.js-account-details-form'));
                    bindInputs(accountProfileForms.querySelector('.js-public-profile-form'));
                }
            }
        };
    })();

}); // define
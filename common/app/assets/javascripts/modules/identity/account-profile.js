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
        };

        return {
            init: function (context) {

                var accountProfileForms = context.querySelector(".js-account-profile-forms");

                if (accountProfileForms) {
                    var forms = accountProfileForms.querySelectorAll('form');
                    var inputs = Array.prototype.slice.call(document.querySelectorAll(".text-input"));
                    for (var i = inputs.length - 1; i >= 0; i--) {
                        inputs[i].addEventListener("change", onInputChange);
                    }

                }
            }
        };
    })();

}); // define
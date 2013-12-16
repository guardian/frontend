define([
    'bean',
    'bonzo',
    'utils/ajax',
    "modules/identity/api"
], function(bean, bonzo, ajax, IdApi) {
	return {
		
		init: function (context) {
			this.button = context.querySelector('#emailSignup');
			if (this.button && IdApi.isUserLoggedIn()) {
				bonzo(this.button).removeClass("u-h");
				bean.on(this.button, 'click', this.requestEmailSignup.bind(this));
			}
		},

		requestEmailSignup: function (event) {
			event.preventDefault();
			
			var self = this;
			self.button.innerHTML = "Loading...";
			IdApi.emailSignup(self.button.getAttribute("data-list-id")).then(function success (res) {
				if (res.status === 'ok') {
					self.button.innerHTML = "Signup successfull";
				} else {
					self.button.innerHTML = "An error occured, please try again";
				}
			}, function error () {
				self.button.innerHTML = "An error occured, please try again";
			});
		}

	};
});
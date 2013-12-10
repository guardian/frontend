define(function () {

	function Spy () {
		var count, spy;

		count = 0;
		spy = function () {};

		spy.calledNever = function () { return count == 0; };
		spy.calledOnce = function () { return count == 1; };
		spy.calledTwice = function () { return count == 2; };
		spy.calledMany = function (howMany) { return count == howMany; };
		spy.callCount = function () { return count; };

		return spy;
	}

	return Spy;

});

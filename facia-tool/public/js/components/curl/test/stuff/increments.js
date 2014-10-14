var counter;
define([], function () {
	if (typeof counter == 'undefined') counter = 0;
	else counter++;
	return counter;

});

define(['knockout'], function (Knockout) {

	return function() {
		this.type     = 'tag';
    	this.id       = Knockout.observable('');
    	this.title 	  = Knockout.observable('');
    	this.numItems = Knockout.observable(3);
    	this.lead 	  = true;
    	this.showMore = Knockout.observable(false);

        this.update = function(data)
        {
            for (prop in data) {
                if (this[prop] && Knockout.isObservable(this[prop])) {
                    this[prop](data[prop]);
                }
            }
        }

        this.clear = function()
        {
            for (prop in this) {
                if (Knockout.isObservable(this[prop])) {
                    this[prop]('');
                }
            }
        }
	};

});

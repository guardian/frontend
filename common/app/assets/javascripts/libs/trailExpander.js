define(["bean", guardian.js.modules["$g"]], function(bean, $g) {

	// show hidden related stories when clicked

	function bindExpander(expander) {
		var link = $g.qs('.expander', expander);
		if (link) {
			bean.add(link, 'click', function(e){
				var lis = expander.querySelectorAll('li'); // todo: x-browser
				for (i=0, l=lis.length; i<l; i++) {
					lis[i].style.display = "block";
				}
				$g.hide(link);
				e.preventDefault();
			});
		}
	}

	// add listener
	function init() {
		guardian.js.ee.addListener('addExpander', bindExpander);
	}

	return { 
		init: init
	};

});
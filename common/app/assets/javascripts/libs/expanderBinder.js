define(["bean", guardian.js.modules["$g"]], function(bean, $g) {

	// show hidden related stories when clicked

	function bindSingleExpander(expander) {
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

	function bind(expanders) {
		if (expanders.length > 1) { // bind multiple
			for (var i=0, l=expanders.length; i<l; i++) {
				bindSingleExpander(expanders[i]);
			}
		} else {
			bindSingleExpander(expanders); // bind only 1
		}
	}

	// add listener
	function init() {
		guardian.js.ee.addListener('addExpander', bind);
	}

	return { 
		init: init
	};

});
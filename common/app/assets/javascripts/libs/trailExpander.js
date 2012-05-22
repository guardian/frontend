define(["bean"], function(bean) {
	// show hidden related stories when clicked

	function bindExpanders() {
	
		var expanders = document.getElementsByClassName('js-expand-trailblock');

		for (i=0, l=expanders.length; i<l; i++) {
			// listen for clicks on each expander
			bean.add(expanders[i], 'click', function(e){
				var link = this;
				var lis = link.parentNode.parentNode.querySelectorAll('li');
				for (j=0, l2=lis.length; j<l2; j++) {
					lis[j].style.display = "block";
				}
				link.parentNode.style.display = "none";
				e.preventDefault();
			});
		}

	}

	return { 
		bindExpanders: bindExpanders
	};

});
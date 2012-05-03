define(["bean"], function(bean) {
	// show hidden related stories when clicked
	var relatedExpander = document.getElementById('js-more-related-content');
	bean.add(relatedExpander, 'click', function(e){
		var lis = document.querySelectorAll(".expandable li");
		for (i=0, l=lis.length; i<l; i++) {
			lis[i].style.display = "block";
		}
		relatedExpander.style.display = "none";
		e.preventDefault();
	});
});
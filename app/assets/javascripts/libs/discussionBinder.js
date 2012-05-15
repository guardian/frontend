define(["bean", guardian.js.modules.fetchDiscussion, "bonzo"], function(bean, discussion, _bonzo_) {

	function renderDiscussion(discussionData) {
		// insert HTML to DOM (update/create depending on shouldBindEvents)
		// if shouldBindEvents then remove old one (if set)
		// then add new ones
		var commentsPlaceholder = document.createElement("div");
		commentsPlaceholder.id = 'commentsPlaceholder';
        commentsPlaceholder.className = 'comments';
        commentsPlaceholder.innerHTML = discussionData.html;
        var article = document.querySelector("article");
        bonzo(commentsPlaceholder).insertAfter(article);

        //var parent = article.parentNode;
        //parent.insertBefore(commentsPlaceholder, article.nextSibling);

        if (discussionData.hasMoreCommentsToShow) {
        	// add discussionData.expanderHtml to DOM
        	// need to only do this once

        	var expanderElement = document.createElement('div');
        	expanderElement.id = 'js-discussion-expander-container';
        	expanderElement.innerHTML = discussionData.expanderHtml;
        	bonzo(expanderElement).insertAfter(article);

        	var expander = document.getElementById('js-discussion-expander');
        	bean.remove(expander, 'click.discussion'); // cleanup old one
        	bean.add(expander, 'click.discussion', function(){
        		var nextPage = discussionData.currentPage + 1;
        		discussion.fetchCommentsForContent(guardian.page.shortUrl, discussionData.commentsPerPage, nextPage, renderDiscussion);
        	});
        } else {
        	bonzo(document.getElementById('js-discussion-expander-container')).remove();
        }

	}

	return { 
		renderDiscussion: renderDiscussion
	};

});
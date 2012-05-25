define(["bean", guardian.js.modules.fetchDiscussion, "bonzo"], function(bean, discussion, bonzo) {

	function renderDiscussion(discussionData) {

        // if this is page 1, then we add the expander and header and create the div
        // otherwise we just append stuff to the newly-created comments placeholder

        // if we're loading the first dataset, let's add the heading on top
        if (discussionData.currentPage == 1) {
            // create the comments block
            var commentsPlaceholder = document.createElement("div");
            commentsPlaceholder.id = 'commentsPlaceholder';
            commentsPlaceholder.className = 'comments';
            commentsPlaceholder.innerHTML = (discussionData.htmlHeader + discussionData.html);
            var article = document.querySelector("article");
            bonzo(commentsPlaceholder).insertAfter(article);
        } else { // comments block already exists, so add to it
            document.querySelector('#commentsPlaceholder').innerHTML += discussionData.html;
        }

        // create and bind comments expander (if we need one)
        if (discussionData.hasMoreCommentsToShow) {
        	
            // add discussionData.expanderHtml to DOM
        	// we only need to do this once
            if (discussionData.currentPage == 1) {
        	   var expanderElement = document.createElement('div');
        	   expanderElement.id = 'js-discussion-expander-container';
               expanderElement.className = 'component';
        	   expanderElement.innerHTML = discussionData.expanderHtml;
        	   bonzo(expanderElement).insertAfter(document.querySelector('#commentsPlaceholder')); // make this at the end
            } else { // update the total count on the button
                document.querySelector('#js-discussion-expander-container').innerHTML = discussionData.expanderHtml;
            }

        	var expander = document.getElementById('js-discussion-expander');
        	bean.remove(expander, 'click.discussion'); // cleanup old one
            // bind to fetch more comments
        	bean.add(expander, 'click.discussion', function(){
        		var nextPage = discussionData.currentPage + 1;
        		discussion.fetchCommentsForContent(guardian.page.shortUrl, discussionData.commentsPerPage, nextPage, renderDiscussion);
        	});
        } else { // we've loaded them all, remove the expander
        	bonzo(document.getElementById('js-discussion-expander-container')).remove();
        }

	}

	return { 
		renderDiscussion: renderDiscussion
	};

});
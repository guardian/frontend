define([
    'bonzo',
    'ajax'
], function (
    bonzo,
    ajax
) {

    var attributeName = "data-discussion-id",
        countUrl = "/discussion/comment-counts.json?shortUrls=",
        tpl = '';
        tpl += '<span class="trail__comment-count">';
        tpl += '<a href="[URL]" data-link-name="Comment count"><i class="i i-comment-count-small"></i>[COUNT]</a>';
        tpl += '</span>';


    function getContentIds(context) {
        var nodes = context.querySelectorAll("[" + attributeName + "]"),
            l = nodes.length-1,
            data = "";

        Array.prototype.forEach.call(nodes, function(el, i) {
            data += el.getAttribute(attributeName);
            if(i < l) { data += ','; }
        });

        return data;
    }

    function getContentUrl(node) {
        return node.querySelector('a').href + '#comments';
    }

    function renderCounts(counts, context) {
        counts.forEach(function(c){
            var node = context.querySelector('[data-discussion-id="' + c.id +'"]'),
                url = getContentUrl(node),
                data = tpl.replace("[URL]", url);

            bonzo(node).append(data.replace("[COUNT]", c.count));
        });
    }

    function getCommentCounts(context) {
        var ids = getContentIds(context);

        ajax({
            url: countUrl + ids,
            type: 'json',
            method: 'get',
            crossOrigin: true,
            success: function(response) {
                if(response && response.counts) {
                    renderCounts(response.counts, context);
                }
            }
        });
    }

    function init(context) {
        getCommentCounts(context);
    }

    return {
        init: init
    };

});

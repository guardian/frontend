define([
    'common',
    'bonzo',
    'ajax'
], function (
    common,
    bonzo,
    ajax
) {

    var attributeName = "data-discussion-id",
        countUrl = "/discussion/comment-counts.json?shortUrls=",
        tpl = '<span class="trail__count trail__count--commentcount">';
        tpl += '<a href="[URL]" data-link-name="Comment count"><i class="i"></i>[COUNT]';
        tpl += '<span class="u-h"> comments</span></a></span>';

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
        return node.querySelector('a').pathname + '#comments';
    }

    function renderCounts(counts, context) {
        counts.forEach(function(c){
            var node = context.querySelector('[data-discussion-id="' + c.id +'"]');
            if(node) {
                var url = getContentUrl(node),
                    data = tpl.replace("[URL]", url);

                // put in trail__meta, if exists
                var meta = node.querySelector('.item__meta, .card__meta'),
                    $node = meta ? bonzo(meta) : bonzo(node);

                $node.append(data.replace("[COUNT]", c.count));
                node.removeAttribute(attributeName);
            }
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
                    common.mediator.emit('modules:commentcount:loaded', response.counts);
                }
            }
        });
    }

    function init(context) {
        if(context.querySelector("[data-discussion-id]")) {
            getCommentCounts(context);
        }

        //Load new counts when more trails are loaded
        common.mediator.on('module:trailblock-show-more:render', function() { getCommentCounts(context); });
        common.mediator.on('modules:related:loaded', function() { getCommentCounts(context); });
    }

    return {
        init: init,
        getCommentCounts: getCommentCounts,
        getContentIds: getContentIds
    };

});

define([
    'common/utils/mediator',
    'bonzo',
    'common/utils/ajax'
], function (
    mediator,
    bonzo,
    ajax
) {

    var attributeName = 'data-discussion-id',
        countUrl = '/discussion/comment-counts.json?shortUrls=',
        tpl = '<span class="trail__count trail__count--commentcount tone-colour">';
        tpl += '<a href="[URL]" data-link-name="Comment count"><i class="i i-comment-light-grey"></i>[COUNT]';
        tpl += '<span class="u-h"> [LABEL]</span></a></span>';

    function getContentIds() {
        var nodes = document.body.querySelectorAll('[' + attributeName + ']'),
            l = nodes.length-1,
            data = '';

        Array.prototype.forEach.call(nodes, function(el, i) {
            data += el.getAttribute(attributeName);
            if(i < l) { data += ','; }
        });

        return data;
    }

    function getContentUrl(node) {
        return node.getElementsByTagName('a')[0].pathname + '#comments';
    }

    function renderCounts(counts) {
        counts.forEach(function(c){
            var node = document.body.querySelector('[data-discussion-id="' + c.id +'"]');
            if (node) {
                if (node.getAttribute('data-discussion-closed') === 'true' && c.count === 0) {
                    return; // Discussion is closed and had no comments, we don't want to show a comment count
                }
                var url = getContentUrl(node),
                    data = tpl.replace('[URL]', url);

                data = data.replace('[LABEL]', (c.count === 1 ? 'comment' : 'comments'));

                // put in trail__meta, if exists
                var meta = node.querySelector('.item__meta, .card__meta, .js-append-commentcount'),
                    $node = meta ? bonzo(meta) : bonzo(node);

                $node.append(data.replace('[COUNT]', c.count));
                node.removeAttribute(attributeName);
            }
        });
    }

    function getCommentCounts() {
        var ids = getContentIds();
        ajax({
            url: countUrl + ids,
            type: 'json',
            method: 'get',
            crossOrigin: true,
            success: function(response) {
                if(response && response.counts) {
                    renderCounts(response.counts);
                    mediator.emit('modules:commentcount:loaded', response.counts);
                }
            }
        });
    }

    function init() {
        if(document.body.querySelector('[data-discussion-id]')) {
            getCommentCounts();
        }

        //Load new counts when more trails are loaded
        mediator.on('module:trailblock-show-more:render', function() { getCommentCounts(); });
        mediator.on('modules:related:loaded', function() { getCommentCounts(); });
    }

    return {
        init: init,
        getCommentCounts: getCommentCounts,
        getContentIds: getContentIds
    };

});

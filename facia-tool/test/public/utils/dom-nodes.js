define(function () {
    function droppableCollection (index) {
        return document.querySelectorAll('.collection')[index - 1].querySelector('.droppable');
    }

    function droppableGroup (collection, index) {
        return document.querySelectorAll('.collection')[collection - 1].querySelectorAll('.droppable')[index - 1];
    }

    function latestArticle (index) {
        return document.querySelector('.latest-articles .article:nth-child(' + (index || 1) + ')');
    }

    function articleInside (root, index) {
        return root.querySelector('.article:nth-child(' + (index || 1) + ')');
    }

    return {
        droppableCollection: droppableCollection,
        droppableGroup: droppableGroup,
        latestArticle: latestArticle,
        articleInside: articleInside
    };
});

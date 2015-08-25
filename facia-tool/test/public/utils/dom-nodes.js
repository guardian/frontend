import jQuery from 'jquery';

function collection(index) {
    return document.querySelectorAll('.collection')[index - 1];
}

function droppableCollection(index) {
    return collection(index).querySelector('.droppable');
}

function droppableGroup(collectionIndex, index) {
    return collection(collectionIndex).querySelectorAll('.droppable')[index - 1];
}

function latestArticle(index) {
    return articleInside(document.querySelector('.latest-articles'), index);
}

function articleInside(root, index) {
    return root.querySelector('trail-widget:nth-child(' + (index || 1) + ') .article');
}

function click(element) {
    var evt = document.createEvent('Events');
    evt.initEvent('click', true, false);
    element.dispatchEvent(evt);
}

function $(query) {
    return document.querySelector(query);
}

function type(where, what) {
    return jQuery(where).val(what).change();
}

export {
    collection,
    droppableCollection,
    droppableGroup,
    latestArticle,
    articleInside,
    click,
    $,
    type
};

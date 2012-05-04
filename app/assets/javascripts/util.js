/*
    Module: util.js
    Description: Light-weight utility DOM functions.
*/
/*jshint strict: false */

define(function () {

    /* native method to add a class */
    function addClass(elm, classname) {
        var re = new RegExp(classname, 'g');
        if(!elm.className.match(re)){
            elm.className += ' ' + classname;
        }
    }

    /* native method to remove a class */
    function removeClass(elm, classname) {
        var re = new RegExp(classname, 'g');
        elm.className = elm.className.replace(re, '');
    }

    /* convenience method to swap one class for another */
    function swapClass(elm, class_to_remove, class_to_add) {
        remove_class(elm, class_to_remove);
        add_class(elm, class_to_add);
    }

    return {
        'addclass': addClass,
        'removeClass': removeClass,
        'swapClass': swapClass
    }
});
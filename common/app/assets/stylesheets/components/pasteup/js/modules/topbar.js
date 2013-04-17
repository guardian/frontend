/*
    Module: topbar.js
    Description: Used by the topbar module to wrap up menu on smaller screens,
*/
/*jshint strict: false */

define(function() {

    var hidden = true,
        topbar = document.querySelector('.topbar'),
        menuContainer = document.querySelector('.topbar-menu-container');

    function addLink() {
        var linkText = topbar.getAttribute('data-show-link');
        if (linkText && window.innerWidth <= 600) {

            // Hide the menus if we're small screen.
            menuContainer.style.display = 'none';

            // Create the link
            var showLink = document.createElement('a');
            showLink.href = '#';
            showLink.className = 'topbar-show';
            showLink.innerHTML = linkText;
            showLink.onclick = function() {
                toggle();
                return false;
            };

            // Append it to the document, and then hide menu.
            menuContainer.parentElement.insertBefore(showLink, menuContainer);
        }
    }

    function toggle() {
        if (hidden) {
            show();
        } else {
            hide();
        }
    }

    function show() {
        menuContainer.style.display = 'block';
        hidden = false;
    }

    function hide() {
        menuContainer.style.display = 'none';
        hidden = true;
    }

    return {
        addLink: addLink
    };
});
define([
    'common/utils/$'
], function (
    $
) {
    var ACTIVE_CLASS = 'active';

    function init() {
        $.forEachElement(('[data-amount]'), function(el){
            el.addEventListener('click', function () {
                var element = event.currentTarget;
                var amount = element.getAttribute('data-amount');
                select(element);
                setAmount(amount);
            });
        });
    }

    var getSpecifiedAncestor = function(element, ancestorClass) {
        var i = 0;
        do {
            element = element.parentNode;
            if (i > 10) {
                throw 'You are either traversing a lot of elements! Is this wise? Or your $element argument is undefined';
            }
            i++;
        } while (element && !element.classList.contains(ancestorClass));
        return element;
    };

    function select(el) {
        $(getSpecifiedAncestor(el, 'js-button-group').querySelectorAll('.js-button')).removeClass(ACTIVE_CLASS);
        $(el).addClass(ACTIVE_CLASS);
    }

    function setAmount(amount) {
        var a = document.querySelector('.js-submit-input');
        a.href = a.href.replace(/amount=.*/, 'amount=' + amount.toString());
    }


    return {
        init: init
    };

});

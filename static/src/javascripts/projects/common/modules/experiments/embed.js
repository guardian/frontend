define([
    'common/utils/$'
], function (
    $
) {
    var ACTIVE_CLASS = 'active';
    var AMOUNT_CLASS = 'js-amount';


    function init() {
        console.log("herer");
        $.forEachElement(("[data-amount]"), function(el){
            el.addEventListener('click', ev => {
                console.log("here2r");
                var element = ev.currentTarget;
                var amount = element.getAttribute('data-amount');
                select(element);
                setAmount(amount);
            });
        });
    }

    var getSpecifiedParent = function(element, parentClass) {
        var i = 0;
        do {
            element = element.parentNode;
            if (i > 10) {
                throw 'You are either traversing a lot of elements! Is this wise? Or your $element argument is undefined';
            }
            i++;
        } while (element && !element.classList.contains(parentClass));
        return element;
    };

    function select(el) {
        $(getSpecifiedParent(el, 'js-button-group').querySelectorAll('.js-button')).removeClass(ACTIVE_CLASS);
        $(el).addClass(ACTIVE_CLASS);
    }

    function setAmount(amount) {
        $('input.' + AMOUNT_CLASS).val(amount);
        var a = document.querySelector('.js-submit-input');
        a.href = "https://contribute.theguardian.com/uk?INTCMP=co_uk_cobed_like_interactive&amount=" + amount.toString();
    }


    return {
        init: init
    };

});

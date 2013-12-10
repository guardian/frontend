define(['EventEmitter'], function (Mediator) {

    return {
        mediator: new Mediator(),

        queryParams: (function(){
            var vars = {},
            hash = window.location.search,
            items,
            item,
            i;
            if (hash) {
                items = hash.slice(1).split('&');
                for (i = 0; i < items.length; i += 1) {
                    item = items[i].split('=');
                    vars[item[0]] = item[1];
                }
            }
            return vars;
        }()),

        hasVh : function() {
            var elem = document.createElement('div'),
                height = parseInt(window.innerHeight/2,10),
                compStyle;

            document.body.appendChild(elem);
            elem.style.height = '50vh';

            compStyle = parseInt((window.getComputedStyle ?
                                      getComputedStyle(elem, null) :
                                      elem.currentStyle)['height'],10);

            document.body.removeChild(elem);

            return (compStyle == height);
        }, 

        stripTags: function (html) {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText;
        }
    };

});


define(['common'], function (common) {

    var $g = common.$;

    function bind() {
        console.log('binding');
        var tabs = $g('.tabs');

        for (var i in tabs) {
            console.log(tabs[i]);
        }
    }

    return {
        init: bind();
    }

});
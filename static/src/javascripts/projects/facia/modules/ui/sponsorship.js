define([
    'common/utils/_',
    'bean',
    'Promise'
], function (
    _,
    bean,
    Promise
) {
    console.log("hi");

    var keyPressHistory = [],
        cheatCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    function listenForCheatCode() {
        return new Promise(function (resolve) {
            bean.on(window, 'keypress', function (event) {
                keyPressHistory.push(event.keyCode);

                console.log("new history", keyPressHistory);

                if (_.isEqual(cheatCode.slice(keyPressHistory.length), keyPressHistory)) {
                    if (keyPressHistory.length === cheatCode.length) {
                        resolve();
                    }
                } else {
                    keyPressHistory = [];
                }
            });
        });
    }

    function disco() {
        console.log("CHEAT!");
    }

    return function () {
        listenForCheatCode().then(disco);
    };
});
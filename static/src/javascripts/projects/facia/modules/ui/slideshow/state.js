define([
    'Promise',
    'common/utils/_',
    'facia/modules/ui/slideshow/dom'
], function (
    Promise,
    _,
    defaultDOMUtility
) {
    function State(list, overrideDOM) {
        var currentState = 0,
            listOfImages = list,
            imagesAlreadyLoaded = [list[0]],
            playTimeoutID,
            dom = overrideDOM || defaultDOMUtility;

        this.active = function () {
            return listOfImages[currentState];
        };

        this.goTo = function (step) {
            if (step >= listOfImages.length) {
                step = 0;
            }
            if (step === currentState) {
                return Promise.resolve();
            }
            var oldImage = imagesAlreadyLoaded[currentState],
                newImage = imagesAlreadyLoaded[step],
                insertPromise = newImage ?
                    Promise.resolve(newImage) :
                    dom.insert(listOfImages[step]);

            return new Promise(function (resolve) {
                insertPromise.
                then(function (newImage) {
                    imagesAlreadyLoaded[step] = newImage;
                    return dom.transition(oldImage, newImage);
                })
                .then(function () {
                    return dom.remove(oldImage);
                })
                .then(function () {
                    currentState = step;
                    resolve();
                })
                .catch(function () {
                    listOfImages.splice(step, 1);
                    imagesAlreadyLoaded.splice(step, 1);
                    this.goTo(step).then(resolve);
                }.bind(this));
            }.bind(this));
        };

        this.next = function () {
            return this.goTo(currentState + 1);
        };

        function advance() {
            playTimeoutID = setTimeout(function () {
                this.next().then(advance.bind(this));
            }.bind(this), stateMachine.interval);
        }

        this.start = function () {
            this.stop();
            advance.call(this);
        };

        this.stop = function () {
            clearTimeout(playTimeoutID);
            playTimeoutID = null;
        };
    }

    function init(list, overrideDOM) {
        return new State(list, overrideDOM);
    }

    var stateMachine = {
        init: init,
        interval: 4000
    };
    return stateMachine;
});

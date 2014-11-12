define(['modules/droppable'], function (
    droppable
) {
    function Article (element) {
        this.Text = element.querySelector('a').getAttribute('href');
    }

    function Event (extend) {
        this.preventDefault = function () {};
        this.stopPropagation = function () {};
        _.extend(this, extend);
    }

    function drop (element, target, source) {
        droppable.listeners.drop(element, new Event({
            target: target,
            dataTransfer: {
                getData: function (what) {
                    var value = source[what];
                    return value || '';
                }
            }
        }));
    }

    function over (element, target, source) {
        droppable.listeners.dragover(element, new Event({
            target: target
        }));
    }

    function createDroppable (element) {
        return {
            drop: function (target, source) {
                drop(element, target, source);
            },
            dragover: function (target, source) {
                over(element, target, source);
            }
        };
    }

    return {
        Article: Article,
        droppable: createDroppable
    };
});

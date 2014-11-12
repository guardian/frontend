define(['modules/droppable',], function (
    droppable
) {
    function Article (element) {
        this.Text = element.querySelector('a').getAttribute('href');
    }

    function drop (target, source) {
        droppable.listeners.drop(target, {
            target: target,
            dataTransfer: {
                getData: function (what) {
                    var value = source[what];
                    return value || '';
                }
            },
            preventDefault: function () {},
            stopPropagation: function () {}
        });
    }

    return {
        Article: Article,
        drop: drop
    };
});

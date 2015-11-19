define([
    'bean',
    'qwery',
    'common/utils/$',
    'fastdom'
], function (
    bean,
    qwery,
    $,
    fastdom
) {
    /**
     * @param {String} type 'add' or 'remove'
     * @param {Object} $el $ element
     * @param {String} cssClass The class to add or remove
     * @param {Function} testFunc A callback function that should return boolean describing whether we
     * should perform the add or remove class
     */
    function updateClass(type, $el, cssClass, testFunc) {
        return function () {
            // If we pass a boolean for test, then check if we should update the class
            var updateClass = (testFunc !== undefined) ? testFunc() : true;

            if (updateClass) {
                fastdom.write(function () {
                    $el[(type === 'add') ? 'addClass' : 'removeClass'](cssClass);
                });
            }
        };
    }

    return {
        init: function (el, opts) {
            var $el = $(el),
                $input = $(opts.textInputClass, el),
                $label = $(opts.labelClass, el),
                hiddenLabelClass = opts.hiddenLabelClass,
                labelEnabledClass = opts.labelEnabledClass;

            // Add the js only styling class for inline label enabled
            updateClass('add', $el, labelEnabledClass)();

            // Check if the input val is empty and if not, hide the label
            if ($input.val() !== '') { updateClass('add', $label, hiddenLabelClass)(); }

            // Bind to focus and blur handlers to update class based on input
            // Not delegated as bean doesn't support it on focus & blur
            bean.on($input[0], {
                focus: updateClass('add', $label, hiddenLabelClass),
                blur: updateClass('remove', $label, hiddenLabelClass, function () {
                    return $input.val() === '';
                })
            });
        }
    };
});

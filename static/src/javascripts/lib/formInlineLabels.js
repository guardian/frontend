// @flow
import bean from 'bean';
import $ from 'lib/$';
import fastdom from 'fastdom';

const updateClass = (
    type: string,
    $el: Object,
    cssClass: string,
    testFunc?: Function
): Function => () => {
    // If we pass a boolean for test, then check if we should update the class
    const shouldUpdateClass = testFunc !== undefined ? testFunc() : true;

    if (shouldUpdateClass) {
        fastdom.write(() => {
            $el[type === 'add' ? 'addClass' : 'removeClass'](cssClass);
        });
    }
};

export default {
    init(el: string, opts: Object) {
        const $el = $(el);
        const $input = $(opts.textInputClass, el);
        const $label = $(opts.labelClass, el);
        const { hiddenLabelClass, labelEnabledClass } = opts;

        // Add the js only styling class for inline label enabled
        updateClass('add', $el, labelEnabledClass)();

        // Check if the input val is empty and if not, hide the label
        if ($input.val() !== '') {
            updateClass('add', $label, hiddenLabelClass)();
        }

        // Bind to focus and blur handlers to update class based on input
        // Not delegated as bean doesn't support it on focus & blur
        bean.on($input[0], {
            focus: updateClass('add', $label, hiddenLabelClass),
            blur: updateClass(
                'remove',
                $label,
                hiddenLabelClass,
                () => $input.val() === ''
            ),
        });
    },
};

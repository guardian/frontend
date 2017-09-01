/*
    Module: expandable.js
    Description: Used to make a list of items expand and contract
*/
import $ from 'lib/$';
import bean from 'bean';
import bonzo from 'bonzo';
/*
    @param {Object} options hash of configuration options:
        dom           : DOM element to convert
        expanded      : {Boolean} Whether the component should init in an expanded state
        showCount     : {Boolean} Whether to display the count in the CTA
        buttonAfterEl : {Element} Element to add the button after (defaults to last child of dom)
*/
const Expandable = options => {
    const opts = options || {};

    const // root element of the trailblock
    dom = $(opts.dom);

    let // true = open, false = closed
    expanded = (opts.expanded === false) ? false : true;

    const cta = document.createElement('button');
    const showCount = (opts.showCount === false) ? false : true;

    const renderState = () => {
        if (expanded) {
            dom.removeClass('shut');
        } else {
            dom.addClass('shut');
        }
    };

    const getCount = () => parseInt(dom.attr('data-count'), 10);

    const updateCallToAction = () => {
        let text = 'Show ';
        if (showCount) {
            text += getCount() + ' ';
        }
        text += (expanded) ? 'fewer' : 'more';
        cta.innerHTML = text;
        cta.setAttribute('data-link-name', 'Show ' + ((expanded) ? 'more' : 'fewer'));
        cta.setAttribute('data-is-ajax', '1');
    };

    const // Model
    model = {

        toggleExpanded() {
            expanded = (expanded) ? false : true;
            renderState();
            updateCallToAction();
        },

        getCount,

        isOpen() {
            return (dom.hasClass('shut')) ? false : true;
        }
    };

    const // View
    view = {

        updateCallToAction,

        renderState,

        renderCallToAction() {
            bean.add(cta, 'click', () => {
                model.toggleExpanded();
            });
            cta.className = 'cta';
            if (opts.buttonAfterEl) {
                bonzo(opts.buttonAfterEl).after(cta);
            } else {
                dom[0].appendChild(cta);
            }
            view.updateCallToAction();
        },

        scrollToCallToAction() {
            // feels a bit hacky but need to give the transition time to finish before scrolling
            if (!expanded) {
                window.setTimeout(() => {
                    cta.scrollIntoView();
                }, 550);
            }
        }
    };

    return {
        init() {

            if (dom.hasClass('expandable-initialised') || !dom.html() || model.getCount() < 3) {
                return false;
            }
            dom.addClass('expandable-initialised');

            view.renderCallToAction();
            view.renderState();
        },
        toggle: model.toggleExpanded
    };
};

export default Expandable;

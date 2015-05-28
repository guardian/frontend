define([
    'react',
    'common/modules/accessibility/main'
], function (
    React,
    accessibility
) {
    function init(callback) {
        var BinaryToggle = React.createClass({
            render: function() {
                return React.DOM.label(null, [
                    React.DOM.input({
                        key: this.props.name,
                        type: 'checkbox',
                        'data-link-name': this.props.name,
                        defaultChecked: this.props.enabled,
                        onChange: this.props.handleChange
                    })
                ].concat(this.props.label));
            }
        });

        var Accessibility = React.createClass({
            getInitialState: function() {
                return {
                    'flashing-images': accessibility.isOn('flashing-images')
                };
            },
            toggle: function (key) {
                var newState = {};
                newState[key] = !this.state[key];
                this.setState(newState, function () {
                    accessibility.saveState(this.state);
                });
            },
            render: function() {
                return React.DOM.div({
                    'data-link-name': 'accesibility preferences'
                }, [
                    React.DOM.h1({
                        key: 'title',
                        className: 'fc-item__title'
                    }, 'Change the way this site looks.'),
                    React.DOM.p({ key: 'p1' }, 'We aim to make this site accessible to a wide audience and to ensure a great experience for all users by conforming to World Wide Web Consortium accessibility guidelines (W3C\'s WCAG)'),
                    React.DOM.p({ key: 'p2' }, 'However, if you are having trouble reading this website you can change the way it looks or disable some of its functionalities.'),
                    React.createElement(BinaryToggle, {
                        key: 'flashing-images',
                        name: 'flashing-images',
                        label: [
                            React.DOM.strong({
                                key: 'label'
                            }, 'Flashing elements.'),
                            ' Disable any element or image that flashes or animates.'
                        ],
                        enabled: this.state['flashing-images'],
                        handleChange: this.toggle.bind(this, 'flashing-images')
                    })
                ]);
            }
        });

        React.renderComponent(
            React.createElement(Accessibility),
            document.getElementById(module.DOM_ID),
            callback
        );
    }

    var module = {
        DOM_ID: 'js-accessibility-preferences',
        init: init
    };
    return module;
});

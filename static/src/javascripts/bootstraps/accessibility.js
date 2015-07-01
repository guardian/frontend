define([
    'react',
    'common/modules/accessibility/main'
], function (
    React,
    accessibility
) {
    function init(callback) {
        var BinaryToggle = React.createClass({
            render: function () {
                return React.DOM.div({
                    className: 'form-field'
                },
                    React.DOM.div({
                        className: 'checkbox'
                    },
                        React.DOM.label({
                            className: 'label'
                        }, [
                            React.DOM.input({
                                key: this.props.name,
                                type: 'checkbox',
                                'data-link-name': this.props.name,
                                defaultChecked: this.props.enabled,
                                onChange: this.props.handleChange,
                                // TODO damn me when I decided to implement this page
                                // global.css includes pasteup-forms 5 which applies ugly styles
                                // on all inputs. The proper solution is to upgrade pasteup to 6
                                // but I prefer to leave the pleasure to someone else
                                // The style object should be removed once we upgrade. Never probably.
                                style: {
                                    float: 'none',
                                    margin: '3px 0.5ex'
                                }
                            })
                        ].concat(this.props.label))
                    )
                );
            }
        });

        var Accessibility = React.createClass({
            getInitialState: function () {
                return {
                    'flashing-elements': accessibility.isOn('flashing-elements')
                };
            },
            toggle: function (key) {
                var newState = {};
                newState[key] = !this.state[key];
                this.setState(newState, function () {
                    accessibility.saveState(this.state);
                });
            },
            render: function () {
                return React.DOM.form({
                    className: 'form'
                },
                    React.DOM.fieldset({
                        className: 'fieldset'
                    }, [
                        React.DOM.p({ key: 'p1' }, 'We aim to make this site accessible to a wide audience and to ensure a great experience for all users by conforming to World Wide Web Consortium accessibility guidelines (W3C\'s WCAG)'),
                        React.DOM.p({ key: 'p2' }, 'However, if you are having trouble reading this website you can change the way it looks or disable some of its functionalities.'),
                        React.createElement(BinaryToggle, {
                            key: 'flashing-elements',
                            name: 'flashing-elements',
                            label: [
                                React.DOM.strong({
                                    key: 'label'
                                }, 'Flashing elements.'),
                                this.state['flashing-elements'] ?
                                    ' Disable any element or image that flashes or animates.' :
                                    ' Elements disabled. Check to enable elements or images that flash or animate.'
                            ],
                            enabled: this.state['flashing-elements'],
                            handleChange: this.toggle.bind(this, 'flashing-elements')
                        })
                    ])
                );
            }
        });

        React.render(
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

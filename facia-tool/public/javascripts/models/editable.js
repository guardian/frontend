define([
    'Reqwest',
    'knockout',
    'Common'
], function (
    reqwest,
    ko,
    Common
) {

    var Editable = function() {};

    // Generate boolean observables to denote editable states, for array of property names
    Editable.prototype._makeEditable = function (props) {
        var self = this;
        for(var i = 0; i < props.length; i++) {
            var prop = props[i];
            if(this.hasOwnProperty(prop) && this[prop].subscribe) {
                this['_editing_' + prop] = ko.observable(i === 0 && this[prop]() === '');

                this[prop].subscribe(function(value) {
                    if (self._propDelta && self._propDelta.value !== value) {
                        self._propDelta.value = value;

                        reqwest({
                            url: '/frontsapi/listitem/' + self._propDelta.list,
                            contentType: 'application/json',
                            type: 'json',
                            method: 'post',
                            data: JSON.stringify(self._propDelta)
                        }).then(
                            function(resp) { },
                            function(xhr) { console.log(xhr); } // error
                        );
                    }
                    delete self._propDelta;
                });
            }
        }
    };

    function ancestorsData(el, dataAttributeName) {
        var dataAttributeValue = $(el).data(dataAttributeName);
        return dataAttributeValue !== undefined ? dataAttributeValue : el !== document.body ? ancestorsData(el.parentNode, dataAttributeName) : false;
    }

    // Generic edit sate function; looks for a data-edit attribute
    // indicating which property should have its _editing_* observable set to true
    Editable.prototype._edit = function(item, e) {
        var prop = ancestorsData(e.target, 'edit'),
            list = ancestorsData(e.target, 'list-name');

        if(prop && list) {
            this._propDelta = {
                list:     list,
                item:     this.id(),
                property: prop,
                value:    this[prop](),
                verb:     'setProperty'
            };

            if (prop !== false) {
                this['_editing_' + prop](true);
            }
        }
    };

    // when serialising, strip internal properties starting '_'
    Editable.prototype.toJSON = function() {
        var copy = ko.toJS(this),
            prop;
        // Strip temp vars starting '_'
        for (prop in copy) {
            if (0 === prop.indexOf('_')) {
                delete copy[prop];
            }
        }
        return copy;
    };

    return Editable;
});

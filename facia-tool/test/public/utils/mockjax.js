import $ from 'jquery';
import 'jquery-mockjax';

export default $.mockjax;

export function scope () {
    var ids = [];

    var addMocks = function (...mocks) {
        mocks.forEach(function (mock) {
            ids.push($.mockjax(mock));
        });
    };

    addMocks.clear = function () {
        ids.forEach(function (id) {
            $.mockjax.clear(id);
        });
    };

    return addMocks;
}

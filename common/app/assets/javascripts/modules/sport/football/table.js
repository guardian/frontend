define(['common/modules/component'], function(Component) {

var Table = function(competition) {
    this.endpoint = '/'+ competition + '/table.json';
};
Component.define(Table);

return Table;

}); //define

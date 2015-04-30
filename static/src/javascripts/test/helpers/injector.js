var systemNormalize = System.normalize,
    mockedObjects = {};

System.normalize = function (name, parentName) {

    var newName = name;

    if (name in mockedObjects) {
        newName = mockedObjects[name].mockId;
    }

    return systemNormalize.call(this, newName, parentName);    
};    

var Injector = function() {
    // Reset the mockedObjects map.
    for (var moduleName in mockedObjects) {
        System.delete(mockedObjects[moduleName].mockId);        
    }
    mockedObjects = {};
};

Injector.prototype.mock = function(module, mock) {
    var dependency = {
        mock: mock,
        mockId: 'injector/' + module
    };
    mockedObjects[module] = dependency;

    System.set(dependency.mockId, System.newModule(dependency.mock));
    return this;
};

Injector.prototype.store = function(module) {
    if (module in mockedObjects) {
        return mockedObjects[module].mock;
    }
    return null;
};

Injector.prototype.test = function(module, callback) {
    System.delete(module);
    return System.import(module).then(callback);
};

export default Injector;
define(function(
) {
    var systemNormalize = System.normalize,
        mockedObjects = {};

    System.normalize = function (name, parentName) {

        var newName = name;

        if (name in mockedObjects) {
            newName = mockedObjects[name].mockId;
            console.log('normalizing to ' + mockedObjects[name].mockId);
        }

        return systemNormalize.call(this, newName, parentName);    
    };    

    var Injector = function() {
        // Reset the mockedObjects map.
        for (var moduleName in mockedObjects) {
            console.log('deleting object' + mockedObjects[moduleName].mockId);
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

        System.amdDefine(dependency.mockId, dependency.mock);

        console.log('mocked module: ' + module);
    };

    Injector.prototype.test = function(module, callback) {
        return System.import(module).then(callback);
    };

    return Injector;
});

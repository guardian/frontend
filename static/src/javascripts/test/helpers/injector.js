export default class Injector {
   constructor() {
        this.loader = new System.constructor();
        this.loader.config({
            baseURL: System.baseURL,
            defaultJSExtensions: true,
            transpiler: System.transpiler,
            paths: System.paths,
            map: System.map,
            // Map is transformed to packages
            packages: System.packages
        });
        this.loader.normalize = System.normalize;
    }

    mock(mocks) {

        // Support alternative syntax
        if (typeof mocks === 'string') {
            mocks = { [mocks]: arguments[1] };
        }
        Object.keys(mocks).forEach(moduleId => {
            var mock = mocks[moduleId];
            var mappedModuleId = System.map[moduleId] || moduleId;
            this.loader.set(mappedModuleId, this.loader.newModule(mock));
        });
        return this;
    }

    test(dependencies, callback) {
        // Support alternative syntax
        if (typeof dependencies === 'string') {
            dependencies = [dependencies];
        }
        return Promise.all(dependencies.map(dep => this.loader.import(dep)))
            .then(args => callback(...args));
    }
}

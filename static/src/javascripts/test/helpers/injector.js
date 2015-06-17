'format es6';

export default class Injector {
   constructor() {
        this.loader = System.clone();

        this.loader.paths = System.paths;
        this.loader.map = System.map;
        this.loader.normalize = System.normalize;
        this.loader.transpiler = System.transpiler;
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

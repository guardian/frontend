import BaseModel from 'models/base-model';
import columns from 'models/available-columns';
import extensions from 'models/available-extensions';
import mainLayout from 'views/templates/main.scala.html!text';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import inject from 'test/utils/inject';

describe('Extensions', function () {
    beforeEach(function () {
        this.ko = inject(mainLayout + verticalLayout);
    });
    afterEach(function () {
        this.ko.dispose();
    });
    it('nav section', function (done) {
        var baseModel = new BaseModel([
            columns.clipboardTrail
        ], [
            extensions.navSections
        ], {
            params: { layout: 'clipboard' },
            location: { pathname: '' },
            on: () => {},
            off: () => {}
        }, {
            config: { fronts: {} },
            defaults: {
                navSections: ['one', 'two']
            }
        });

        spyOn(baseModel, 'extensionCreated').and.callThrough();

        this.ko.apply(baseModel)
        .then(() => baseModel.loaded)
        .then(() => {
            expect(baseModel.extensionCreated).toHaveBeenCalled();
            var extension = baseModel.extensionCreated.calls.argsFor(0)[0];
            spyOn(extension, 'dispose').and.callThrough();

            expect(baseModel.navSections()).toEqual(['one', 'two']);

            // Modify the state of the model
            baseModel.state({
                defaults: {
                    navSections: ['two', 'three']
                }
            });
            expect(baseModel.navSections()).toEqual(['two', 'three']);

            baseModel.dispose();
            expect(extension.dispose).toHaveBeenCalled();
        })
        .then(done)
        .catch(done.fail);
    });
});

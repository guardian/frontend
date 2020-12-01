import Chance from 'chance';
import $ from 'lib/$';
import { addComponent } from './rhc';

describe('rhc', () => {
    const chance = new Chance();
    const setFixture = (htmlString) => {
        if (document.body) {
            document.body.innerHTML = htmlString;
        }
    };

    test('appends component to empty rhc container', () => {
        const id = chance.word();
        const content = $.create(`<div id="${id}"></div>`);
        const selector = `.js-components-container #${id}`;

        setFixture('<div class="js-components-container"></div>');
        addComponent(content);

        expect($(selector).get(0).id).toEqual(id);
    });

    test('passes its importance to the rhc container', () => {
        const importance = chance.integer();
        const content = $.create(`<div></div>`);
        const selector = `.component--rhc`;

        setFixture('<div class="js-components-container"></div>');
        addComponent(content, importance);

        expect($(selector).first().data('importance')).toEqual(importance);
    });

    test('prepends component in non-empty rhc container before inferior components', () => {
        const inferiorImportance = chance.integer({
            min: 1,
            max: 10,
        });
        const importance = chance.integer({
            min: inferiorImportance + 1,
            max: 100,
        });
        const inferiorId = chance.word();
        const id = chance.word();
        const content = $.create(`<div id="${id}"></div>`);
        const componentClass = `component--rhc`;
        const selector = `.${componentClass} > div`;

        setFixture(`
            <div class="js-components-container">
                <div class="${componentClass}" data-importance="${inferiorImportance}">
                    <div id="${inferiorId}"></div>
                </div>
            </div>
        `);
        addComponent(content, importance);

        expect($(selector).first().get(0).id).toEqual(id);
        expect($(selector).last().get(0).id).toEqual(inferiorId);
    });
});

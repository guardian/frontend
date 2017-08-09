// @flow

import { initTechFeedback } from './tech-feedback';

describe('Tech-feedback', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
               <p id="feedback-warning"></p>
               <form id="feedback__form">
                   <select id="feedback-category">
                       <option id="testoption"
                               value="feedback-form-website">Website</option>
                   </select>
                   <input name="extra"
                          value="">
               </form>',
               <div id="feedback-form-default"></div>',
               <div id="feedback-form-website"></div>'
           `;
        }
    });

    it('Should place the extra information into the form', () => {
        initTechFeedback();

        expect(
            document.querySelectorAll('#feedback__form input[name=extra]')[0]
                .value
        ).toContain('browser');
    });

    it('Should start off with the inputs disabled', () => {
        initTechFeedback();

        expect(
            document.querySelectorAll('#feedback__form input[name=extra]')[0]
                .disabled
        ).toBeTruthy();
    });

    it('Should enable inputs after we choose something from the category select', () => {
        initTechFeedback();

        document
            .getElementById('testoption')
            .setAttribute('selected', 'selected');
        document.getElementById('feedback-category').value =
            'feedback-form-website';
        document
            .getElementById('feedback-category')
            .dispatchEvent(new Event('change'));

        expect(
            document.querySelectorAll('#feedback__form input[name=extra]')[0]
                .disabled
        ).toBeFalsy();
    });
});

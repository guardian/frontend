

import { initTechFeedback } from "./tech-feedback";

jest.mock('lib/raven');
jest.mock('common/modules/experiments/ab', () => ({
  getSynchronousParticipations: () => ({})
}));

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
    initTechFeedback().then(() => {
      const extra: HTMLInputElement = (document.querySelector('#feedback__form input[name=extra]') as any);

      expect(extra.value).toContain('browser');
    });
  });

  it('Should start off with the inputs disabled', () => {
    initTechFeedback().then(() => {
      const extra: HTMLInputElement = (document.querySelector('#feedback__form input[name=extra]') as any);

      expect(extra.disabled).toBeTruthy();
    });
  });

  it('Should enable inputs after we choose something from the category select', () => {
    initTechFeedback().then(() => {
      const extra: HTMLInputElement = (document.querySelector('#feedback__form input[name=extra]') as any);
      const feedback: HTMLInputElement = (document.getElementById('feedback-category') as any);
      const testoption: HTMLElement = (document.getElementById('testoption') as any);

      testoption.setAttribute('selected', 'selected');
      feedback.value = 'feedback-form-website';
      feedback.dispatchEvent(new Event('change'));

      expect(extra.disabled).toBeFalsy();
    });
  });
});

import fastdom from "lib/fastdom-promise";

import { initHostedCarousel } from "./onward-journey-carousel";

describe('Hosted onward journey carousel', () => {
  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = `
                    <div>
                        <div>
                            <span class="prev-oj-item"></span>
                            <span class="next-oj-item"></span>
                        </div>
                    
                        <div class="js-carousel-pages">
                            <div class="carousel-page"></div>
                            <div class="carousel-page"></div>
                            <div class="carousel-page"></div>
                            <div class="carousel-page"></div>
                        </div>
                    
                        <div>
                            <div class="js-carousel-dot highlighted"></div>
                            <div class="js-carousel-dot "></div>
                            <div class="js-carousel-dot "></div>
                            <div class="js-carousel-dot "></div>
                        </div>
                    
                    </div>
                `;
    }
  });

  afterEach(() => {
    if (document.body) {
      document.body.innerHTML = '';
    }
  });

  it('should exist', () => {
    expect(initHostedCarousel).toBeDefined();
  });

  const clickAndExpectNthPage = (clickOn: string, expectedPage: number): any => {
    (document.querySelector(`.${clickOn}`) as any).click();
    return fastdom.read(() => {
      const transform = (1 - expectedPage) * 100;

      expect((document.querySelector('.js-carousel-pages') as any).getAttribute('style')).toEqual(`-webkit-transform: translate(${transform || '-000'}%, 0);`);

      [1, 2, 3, 4].forEach(i => {
        const cssClasses = (document.querySelector(`.js-carousel-dot:nth-child(${i})`) as any).classList.toString();
        if (i === expectedPage) {
          expect(cssClasses).toEqual(expect.stringContaining('highlighted'));
        } else {
          expect(cssClasses).not.toEqual(expect.stringContaining('highlighted'));
        }
      });
    });
  };

  it('should show next page on clicking arrow buttons', done => {
    initHostedCarousel().then(clickAndExpectNthPage('next-oj-item', 2)).then(clickAndExpectNthPage('next-oj-item', 3)).then(clickAndExpectNthPage('prev-oj-item', 2)).then(clickAndExpectNthPage('prev-oj-item', 1)).then(done).catch(done.fail);
  });

  it('should change page on clicking the dots', done => {
    initHostedCarousel().then(clickAndExpectNthPage('js-carousel-dot:nth-child(4)', 4)).then(clickAndExpectNthPage('js-carousel-dot:nth-child(2)', 2)).then(clickAndExpectNthPage('js-carousel-dot:nth-child(3)', 3)).then(clickAndExpectNthPage('js-carousel-dot:nth-child(1)', 1)).then(done).catch(done.fail);
  });
});

import fastdom from "lib/fastdom-promise";
import { init, canAutoplay, triggerEndSlate, addCancelListener } from "commercial/modules/hosted/next-video-autoplay";

jest.mock('common/modules/analytics/google', () => {});
jest.mock('commercial/modules/hosted/next-video', () => ({
  init: () => Promise.resolve(),
  load: () => Promise.resolve()
}));

describe('Next video autoplay', () => {
  const domSnippet = `
        <div>
            <video data-duration="160">
                <source type="video/mp4" src="">
            </video>
        </div>
        <div class="js-hosted-next-autoplay">
            <div class="js-autoplay-timer" data-next-page="/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode2">10s</div>
        </div>
        <button class="js-autoplay-cancel"></button>;
    `;

  const domSnippetNoVideo = '<div class="js-autoplay-timer" data-next-page="">10s</div>';

  beforeEach(done => {
    if (document.body) {
      document.body.innerHTML = domSnippet;
    }

    init().then(done);
  });

  afterEach(() => {
    if (document.body) {
      document.body.innerHTML = '';
    }
  });

  it('should exist', done => {
    expect(init).toBeDefined();
    done();
  });

  it('should trigger autoplay when there is a next video', done => {
    expect(canAutoplay()).toBeTruthy();
    done();
  });

  it('should show end slate information', done => {
    triggerEndSlate();
    fastdom.read(() => {
      expect((document.querySelector('.js-hosted-next-autoplay')).classList.toString()).toEqual(expect.stringContaining('js-autoplay-start'));
      done();
    });
  });

  it('should hide end slate information when cancel button is clicked', done => {
    addCancelListener();
    (document.querySelector('.js-autoplay-cancel')).click();
    fastdom.read(() => {
      expect((document.querySelector('.js-hosted-next-autoplay')).classList.toString()).toEqual(expect.stringContaining('hosted-slide-out'));
      done();
    });
  });

  it('should not trigger autoplay when there is no next video', done => {
    if (document.body) {
      document.body.innerHTML = domSnippetNoVideo;
    }

    init().then(() => {
      expect(canAutoplay()).toBeFalsy();
      done();
    });
  });
});
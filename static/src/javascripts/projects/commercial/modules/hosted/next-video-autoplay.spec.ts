import fastdom from '../../../../lib/fastdom-promise';
import {
	addCancelListener,
	canAutoplay,
	init,
	triggerEndSlate,
} from './next-video-autoplay';

jest.mock('../../../common/modules/analytics/google', () => null);
jest.mock('./next-video', () => ({
	init: () => Promise.resolve(),
	load: () => Promise.resolve(),
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

	const domSnippetNoVideo =
		'<div class="js-autoplay-timer" data-next-page="">10s</div>';

	beforeEach(async (done) => {
		document.body.innerHTML = domSnippet;

		await init().then(done);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should exist', (done) => {
		expect(init).toBeDefined();
		done();
	});

	it.skip('should trigger autoplay when there is a next video', (done) => {
		expect(canAutoplay()).toBeTruthy();
		done();
	});

	it('should show end slate information', async (done) => {
		triggerEndSlate();
		await fastdom.measure(() => {
			expect(
				document
					.querySelector('.js-hosted-next-autoplay')
					?.classList.toString(),
			).toEqual(expect.stringContaining('js-autoplay-start'));
			done();
		});
	});

	it('should hide end slate information when cancel button is clicked', async (done) => {
		addCancelListener();
		const cancelButton = document.querySelector(
			'.js-autoplay-cancel',
		) as HTMLButtonElement;
		cancelButton.click();
		await fastdom.measure(() => {
			expect(
				document
					.querySelector('.js-hosted-next-autoplay')
					?.classList.toString(),
			).toEqual(expect.stringContaining('hosted-slide-out'));
			done();
		});
	});

	it('should not trigger autoplay when there is no next video', async (done) => {
		document.body.innerHTML = domSnippetNoVideo;

		await init().then(() => {
			expect(canAutoplay()).toBeFalsy();
			done();
		});
	});
});

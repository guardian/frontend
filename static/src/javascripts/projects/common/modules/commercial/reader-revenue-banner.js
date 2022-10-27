import config from 'lib/config';
import { reportError } from 'lib/report-error';
import { fetchBannerData, renderBanner } from 'common/modules/support/banner';

const messageCode = 'reader-revenue-banner';

let data = null;

const show = () => (data ? renderBanner(data) : Promise.resolve(false));

const canShow = () => {
	const forceBanner = window.location.search.includes(
		'force-remote-banner=true',
	);
	const enabled = config.get('switches.remoteBanner') || forceBanner;

	if (!enabled) {
		return Promise.resolve(false);
	}

	return fetchBannerData()
		.then((response) => {
			if (response) {
				data = response;
				return true;
			}
			return false;
		})
		.catch((error) => {
			console.log(`Error fetching remote banner data: ${error}`);
			reportError(
				new Error(`Error fetching remote banner data: ${error}`),
				{},
				false,
			);
			return false;
		});
};

export const readerRevenueBanner = {
	id: messageCode,
	show,
	canShow,
};

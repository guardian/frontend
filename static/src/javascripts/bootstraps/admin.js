import { init as initDrama } from 'admin/bootstraps/drama';
import { init as initWarnings } from 'admin/bootstraps/switchwarnings';
import domReady from 'domready';

domReady(() => {
	switch (window.location.pathname) {
		case '/dev/switchboard':
			initDrama();
			initWarnings();
			break;

		default: // do nothing
	}
});

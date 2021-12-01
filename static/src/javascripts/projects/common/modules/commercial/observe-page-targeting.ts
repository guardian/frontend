import type { ContentTargeting } from '@guardian/commercial-core/dist/esm/targeting/content';
import { getContentTargeting } from '@guardian/commercial-core/dist/esm/targeting/content';
import type { PersonalisedTargeting } from '@guardian/commercial-core/dist/esm/targeting/personalised';
import { getPersonalisedTargeting } from '@guardian/commercial-core/dist/esm/targeting/personalised';
import type { ViewportTargeting } from '@guardian/commercial-core/dist/esm/targeting/viewport';
import { getViewportTargeting } from '@guardian/commercial-core/dist/esm/targeting/viewport';
import { cmp, onConsentChange } from '@guardian/consent-management-platform';
import type { Observable } from 'rxjs';
import { bindCallback, combineLatest, from, of } from 'rxjs';
import { distinctUntilChanged, last, map } from 'rxjs/operators';
import { viewport } from 'commercial/observables/viewport';

const viewportTargeting: Observable<ViewportTargeting> = combineLatest([
	viewport,
	from(cmp.willShowPrivacyMessage()),
]).pipe(
	map(([viewportSize, cmpBannerWillShow]) =>
		getViewportTargeting(viewportSize.width, cmpBannerWillShow),
	),
);

const contentTargeting: Observable<ContentTargeting> = of(
	getContentTargeting(
		{
			contentType: 'article',
			contributors: ['Comm-Dev'],
			tones: [],
			surging: 0,
			platform: 'NextGen',
			sensitive: false,
			path: '/world-news',
		},
		{
			s: 'news',
			bl: [],
			dcre: 'f',
			edition: 'uk',
			k: ['world', 'news'],
			ob: null,
			se: [],
			rp: 'dotcom-platform',
		},
	),
);

const consentState = bindCallback(onConsentChange)().pipe(last());
const personalisedTargeting: Observable<PersonalisedTargeting> =
	consentState.pipe(map((state) => getPersonalisedTargeting(state)));

const adTargeting: Observable<
	ViewportTargeting & PersonalisedTargeting & ContentTargeting
> = combineLatest([
	viewportTargeting,
	personalisedTargeting,
	contentTargeting,
]).pipe(
	map(([viewport, personalised, content]) => ({
		...viewport,
		...personalised,
		...content,
	})),
	distinctUntilChanged(
		(prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
	),
	last(),
);

export { adTargeting };

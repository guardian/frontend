import type { OphanComponentType } from '@guardian/libs';
import { addTrackingToUrl } from './linkTracking';

describe('addTrackingToUrl', () => {
	it('adds acquisitionData to a URL without query string args', () => {
		const url = 'https://manage.theguardian.com/settings';
		const componentType: OphanComponentType = 'RETENTION_HEADER';
		const ophanComponent = {
			componentType,
			id: 'settings',
			labels: ['label-1'],
		};

		const urlWithTracking = addTrackingToUrl(
			url,
			ophanComponent,
			'https://www.theguardian.com/uk',
			'page-view-id-123',
		);

		expect(urlWithTracking).toEqual(
			'https://manage.theguardian.com/settings?acquisitionData=%7B%22source%22%3A%22GUARDIAN_WEB%22%2C%22componentId%22%3A%22settings%22%2C%22componentType%22%3A%22RETENTION_HEADER%22%2C%22campaignCode%22%3A%22settings%22%2C%22referrerPageviewId%22%3A%22page-view-id-123%22%2C%22referrerUrl%22%3A%22https%3A%2F%2Fwww.theguardian.com%2Fuk%22%2C%22labels%22%3A%5B%22label-1%22%5D%7D',
		);
	});

	it('adds acquisitionData to a URL with existing query string args', () => {
		const url = 'https://manage.theguardian.com/settings?foo=bar';
		const componentType: OphanComponentType = 'RETENTION_HEADER';
		const ophanComponent = {
			componentType,
			id: 'settings',
			labels: ['label-1'],
		};

		const urlWithTracking = addTrackingToUrl(
			url,
			ophanComponent,
			'https://www.theguardian.com/uk',
			'page-view-id-123',
		);

		expect(urlWithTracking).toEqual(
			'https://manage.theguardian.com/settings?foo=bar&acquisitionData=%7B%22source%22%3A%22GUARDIAN_WEB%22%2C%22componentId%22%3A%22settings%22%2C%22componentType%22%3A%22RETENTION_HEADER%22%2C%22campaignCode%22%3A%22settings%22%2C%22referrerPageviewId%22%3A%22page-view-id-123%22%2C%22referrerUrl%22%3A%22https%3A%2F%2Fwww.theguardian.com%2Fuk%22%2C%22labels%22%3A%5B%22label-1%22%5D%7D',
		);
	});

	it('replaces an existing acquisitionData param', () => {
		const url =
			'https://manage.theguardian.com/settings?acquisitionData=existing';
		const componentType: OphanComponentType = 'RETENTION_HEADER';
		const ophanComponent = {
			componentType,
			id: 'settings',
			labels: ['label-1'],
		};

		const urlWithTracking = addTrackingToUrl(
			url,
			ophanComponent,
			'https://www.theguardian.com/uk',
			'page-view-id-123',
		);

		expect(urlWithTracking).toEqual(
			'https://manage.theguardian.com/settings?acquisitionData=%7B%22source%22%3A%22GUARDIAN_WEB%22%2C%22componentId%22%3A%22settings%22%2C%22componentType%22%3A%22RETENTION_HEADER%22%2C%22campaignCode%22%3A%22settings%22%2C%22referrerPageviewId%22%3A%22page-view-id-123%22%2C%22referrerUrl%22%3A%22https%3A%2F%2Fwww.theguardian.com%2Fuk%22%2C%22labels%22%3A%5B%22label-1%22%5D%7D',
		);
	});
});

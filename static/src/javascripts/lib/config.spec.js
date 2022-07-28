/* eslint-disable guardian-frontend/global-config */

Object.assign(window.guardian.config, {
	page: {
		tones: 'foo',
		series: 'bar',
		references: [{ baz: 'one' }, { baz: 'two' }],
		webPublicationDate: '2013-03-20T17:07:00.000Z',
		pageId: 'politics/2017/mar/14/ukip-donor-arron-banks-says-he-has-quit-party-to-set-up-ukip-20',
		x: {
			y: {
				z: 'z',
			},
		},
		falsyValue: false,
	},
});

// We need to hoist setting the window.guardian.config to code under test above import
// (but can't do it with the jest mocks that get auto-hoisted)
// eslint-disable-next-line import/first
import config from './config';

describe('Config', () => {
	it('should have "hasTone" property', () => {
		expect(config.hasTone('foo')).toBeTruthy();
		expect(config.hasTone('foo-bad')).toBeFalsy();
	});

	it('should have "hasSeries" property', () => {
		expect(config.hasSeries('bar')).toBeTruthy();
		expect(config.hasSeries('bar-bad')).toBeFalsy();
	});

	it('should have "referencesOfType" property', () => {
		expect(config.referencesOfType('baz')).toEqual(['one', 'two']);
		expect(config.referencesOfType('bar-bad')).toEqual([]);
	});

	it('should have "referenceOfType" property', () => {
		expect(config.referenceOfType('baz')).toEqual('one');
		expect(config.referenceOfType('bar-bad')).toBeUndefined();
	});

	it('should have "webPublicationDateAsUrlPart" property', () => {
		expect(config.webPublicationDateAsUrlPart()).toBe('2013/03/20');
	});

	it('should return the expected dateFromSlug', () => {
		expect(config.dateFromSlug()).toEqual('2017/mar/14');
	});

	it('`get` should return a value using dot notation', () => {
		expect(config.get('page.x.y.z')).toEqual('z');
	});

	it('`get` should return undefined for non existing indexes', () => {
		expect(config.get('page.x.z.y')).toEqual(undefined);
		expect(config.get('page.x.z.y', false)).toEqual(false);
	});

	it('`get` should return a value using bracket notation', () => {
		expect(config.get('page[x].y[z]')).toEqual('z');
	});

	it('`get` should return undefined for non-existing key', () => {
		expect(config.get('page.qwert')).toBeUndefined();
	});

	it('`get` should return default value for non-existing key with a default', () => {
		expect(config.get('page.qwert', ['I am the default'])).toEqual([
			'I am the default',
		]);
	});

	it('`get` should return falsy value for defined key with a default', () => {
		expect(config.get('page.falsyValue', 'I am the default')).toEqual(
			false,
		);
	});

	it('`set` should safely set (or orverride) a value deep inside the config object', () => {
		config.set('some.random.path', 'hello');
		expect(config.get('some.random.path')).toEqual('hello');
	});
});

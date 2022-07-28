// This should be the only module accessing the window config object directly
// because this is the one that gets imported to all other modules
// eslint-disable-next-line guardian-frontend/global-config
const config = window.guardian.config;

// allows you to safely get items from config using a query of
// dot or bracket notation, with optional default fallback
const get = (path = '', defaultValue) => {
	const value = path
		.replace(/\[(.+?)\]/g, '.$1')
		.split('.')
		.reduce((o, key) => o && o[key], config);

	if (typeof value !== 'undefined') {
		return value;
	}

	return defaultValue;
};

// let S = { l1, l2, ..., ln } be a non-empty ordered set of labels
// let s = l1.l2.....ln be the string representation of S
// set(s, x) is the function that takes any value x into the config
// object following the path described by S, making sure that path
// actually leads somewhere.
const set = (path, value) => {
	const pathSegments = path.split('.');
	const last = pathSegments.pop();
	pathSegments.reduce((obj, subpath) => {
		if (typeof obj[subpath] === 'object') {
			return obj[subpath];
		}
		obj[subpath] = {};
		return obj[subpath];
	}, config)[last] = value;
};

const hasTone = (name) => (config.page.tones || '').includes(name);

const hasSeries = (name) => (config.page.series || '').includes(name);

const referencesOfType = (name) =>
	(config.page.references || [])
		.filter((reference) => typeof reference[name] !== 'undefined')
		.map((reference) => reference[name]);

const referenceOfType = (name) => referencesOfType(name)[0];

// the date nicely formatted and padded for use as part of a url
// looks like    2012/04/31
const webPublicationDateAsUrlPart = () => {
	const webPublicationDate = config.page.webPublicationDate;

	if (webPublicationDate) {
		const pubDate = new Date(webPublicationDate);
		return `${pubDate.getFullYear()}/${(pubDate.getMonth() + 1)
			.toString()
			.padStart(2, '0')}/${pubDate
			.getDate()
			.toString()
			.padStart(2, '0')}`;
	}

	return null;
};

// returns 2014/apr/22
const dateFromSlug = () => {
	const s = config.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
	return s ? s[0] : null;
};

export default Object.assign(
	{},
	{
		get,
		set,
		hasTone,
		hasSeries,
		referencesOfType,
		referenceOfType,
		webPublicationDateAsUrlPart,
		dateFromSlug,
	},
	config,
);

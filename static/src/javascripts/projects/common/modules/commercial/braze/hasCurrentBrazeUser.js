const KEY = 'gu.brazeUserSet';

const hasCurrentBrazeUser = () => localStorage.getItem(KEY) === 'true';

const setHasCurrentBrazeUser = () => {
	localStorage.setItem(KEY, 'true');
};

const clearHasCurrentBrazeUser = () => {
	localStorage.removeItem(KEY);
};

export {
	hasCurrentBrazeUser,
	setHasCurrentBrazeUser,
	clearHasCurrentBrazeUser,
};

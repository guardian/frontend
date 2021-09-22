export let forceSendMetrics = window.location.hash === '#forceSendMetrics';

export const setForceSendMetrics = (val: boolean): void => {
	forceSendMetrics = val;
};

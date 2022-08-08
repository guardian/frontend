import { initInline } from './dynamic-slots/inline';

const initDynamicSlots = async (): Promise<void> => {
	await Promise.all([initInline()]);
};

export { initDynamicSlots };

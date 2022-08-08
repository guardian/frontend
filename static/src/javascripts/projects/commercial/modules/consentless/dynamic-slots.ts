import { initInline } from './dynamic-slots/inline';

const initDynamicSlots = () => Promise.all([initInline()]);

export { initDynamicSlots };

// @flow
let value = 1234;

export const getMvtValue = () => value;
export const getMvtNumValues = () => 1000000;
export const overwriteMvtCookie = (id: number): void => (value = id);

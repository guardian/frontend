// @flow

import { register } from 'commercial/modules/messenger';
import { registerListeners } from 'commercial/modules/messenger/register-listeners';

jest.mock('commercial/modules/messenger/background', () => {});
jest.mock('commercial/modules/messenger/click', () => {});
jest.mock('commercial/modules/messenger/get-stylesheet', () => {});
jest.mock('commercial/modules/messenger/resize', () => {});
jest.mock('commercial/modules/messenger/scroll', () => ({
    onMessage: jest.fn(),
}));
jest.mock('commercial/modules/messenger/type', () => {});
jest.mock('commercial/modules/messenger/viewport', () => ({
    onMessage: jest.fn(),
}));
jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

describe('Register listeners', () => {
    it('should register listeners', () => {
        registerListeners();
        expect(register).toHaveBeenCalledTimes(7);
        expect(register).toHaveBeenCalledWith('type', expect.anything());
        expect(register).toHaveBeenCalledWith('get-styles', expect.anything());
        expect(register).toHaveBeenCalledWith('resize', expect.anything());
        expect(register).toHaveBeenCalledWith('scroll', expect.anything(), {
            persist: true,
        });
        expect(register).toHaveBeenCalledWith('viewport', expect.anything(), {
            persist: true,
        });
        expect(register).toHaveBeenCalledWith('click', expect.anything());
        expect(register).toHaveBeenCalledWith('background', expect.anything());
    });
});

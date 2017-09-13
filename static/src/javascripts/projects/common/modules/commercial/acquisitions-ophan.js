// @flow
import ophan from 'ophan/ng';

export const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

import { Record } from 'immutable';

export const createDeployRecord = Record({
    build: undefined,
    uuid: undefined,
    projectName: undefined,
    status: undefined,
    time: undefined
}, 'Deploy');

export const createBuildRecord = Record({
    number: undefined,
    projectName: undefined,
    revision: undefined,
    commits: undefined
}, 'Build');

export const createDeployGroupRecord = Record({
    status: undefined,
    build: undefined
}, 'DeployGroup');

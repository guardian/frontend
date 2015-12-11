/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../manual-typings/immutable.d.ts" />

import { List, Map, Record, Iterable } from 'immutable';

export interface Deploy {
    build: number;
    uuid: string;
    projectName: string;
    status: string;
    time: Date;
}

// Typed records taken from
// https://github.com/facebook/immutable-js/issues/341#issuecomment-147940378
export type DeployRecord = Record.IRecord<Deploy>;
export const createDeployRecord = Record<Deploy>({
    build: undefined,
    uuid: undefined,
    projectName: undefined,
    status: undefined,
    time: undefined
}, 'Deploy');

export interface Build {
    number: number;
    // TODO: This is confusing, same name as deploy.projectName
    projectName: string;
    commits: Array<Commit>
}

export interface Commit {
    sha: string,
    username: string,
    message: string
}

export type BuildRecord = Record.IRecord<Build>;
export const createBuildRecord = Record<Build>({
    number: undefined,
    projectName: undefined,
    commits: undefined,
}, 'Build');

export interface DeployGroup {
    status: string,
    build: number
}

export type DeployGroupRecord = Record.IRecord<DeployGroup>;
export const createDeployGroupRecord = Record<DeployGroup>({
    status: undefined,
    build: undefined
}, 'DeployGroup');


export interface DeployJson {
    build: string;
    uuid: string;
    projectName: string;
    status: string;
    time: string;
}

export interface BuildJson {
    number: string;
    projectName: string;
    commits: Array<CommitJson>
}

interface CommitJson {
    sha: string,
    username: string,
    message: string
}

export interface GitHubCompareJson {
    commits: Array<GitHubCommitJson>
}

export interface GitHubCommitJson {
    html_url: string;
    commit: GitHubNestedCommitJson;
}

interface GitHubNestedCommitJson {
    author: GitHubNestedCommitAuthorJson;
    message: string;
}

interface GitHubNestedCommitAuthorJson {
    name: string;
}

export interface GitHubCommit {
    url: string;
    authorName: string;
    message: string;
}

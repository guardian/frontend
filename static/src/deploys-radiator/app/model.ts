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
    status: string;
    state: string;
    revision: string;
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
    // SUCCESS/FAILURE/ERROR(?)
    status: undefined,
    // running/finished
    state: undefined,
    revision: undefined,
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


interface DeployJson {
    build: string;
    uuid: string;
    projectName: string;
    status: string;
    time: string;
}

export interface DeploysJson {
    status: string;
    response: Array<DeployJson>;
}

export interface BuildJsonResponse {
    number: string;
    projectName: string;
    revision: string;
    status: string;
    state: string;
    commits: Array<CommitJson>
}

export interface BuildJson {
    status: string;
    response: BuildJsonResponse;
}

export interface BuildsJson {
    status: string;
    response: Array<BuildJsonResponse>;
}

interface CommitJson {
    sha: string,
    username: string,
    message: string
}

export interface GitHubCompareJson {
    commits: Array<GitHubCommitJson>
}

export interface GitHubNestedAuthorJson {
    login: string;
}

export interface GitHubCommitJson {
    html_url: string;
    commit: GitHubNestedCommitJson;
    author: GitHubNestedAuthorJson;
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
    authorLogin: string;
    message: string;
}

export interface GitHubErrorJson {
    message: string;
}

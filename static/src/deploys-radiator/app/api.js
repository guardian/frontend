import { createDeployRecord, createBuildRecord } from './model';
import { List } from 'immutable';

const apiPath = '/deploys-radiator/api';
export const getDeploys = (stage) => (fetch(`${apiPath}/deploys?projectName=dotcom:&stage=${stage}&pageSize=200`, {
        credentials: 'same-origin'
    })
    .then((response) => response.json())
    .then(deploys => List(deploys.response.map(deploy => createDeployRecord({
        build: Number(deploy.build),
        uuid: deploy.uuid,
        projectName: deploy.projectName.replace(/^dotcom:/, ''),
        status: deploy.status,
        time: new Date(deploy.time)
    })))));

export const getBuild = (build) => (fetch(`${apiPath}/builds/${build}`, {
        credentials: 'same-origin'
    })
    .then((response) => response.json())
    .then(build => build.response)
    .then(build => createBuildRecord({
        number: Number(build.number),
        projectName: build.projectName,
        revision: build.revision,
        commits: build.commits
    })));

const gitHubApiHost = 'https://api.github.com';
export const getDifference = (base, head) => (fetch(`${gitHubApiHost}/repos/guardian/frontend/compare/${base}...${head}`, {
        headers: {
            'Authorization': `token ${window.gitHubAccessToken}`
        }
    })
    .then((response) => {
        if (response.ok) {
            return response.clone().json()
                .then(json => json.commits)
                .then(gitHubCommitsJson => List(gitHubCommitsJson.map((gitHubCommitJson) => ({
                    url: gitHubCommitJson.html_url,
                    authorName: gitHubCommitJson.commit.author.name,
                    authorLogin: (gitHubCommitJson.author) ? gitHubCommitJson.author.login : 'Unknown',
                    message: gitHubCommitJson.commit.message
                }))));
        } else {
            return response.clone().json()
                .then(json => Promise.reject(new Error(json.message)));
        }
    }));

import {
    DeployRecord, createDeployRecord,
    BuildRecord, createBuildRecord,
    DeploysJson, BuildJson,
    GitHubCompareJson, GitHubCommitJson, GitHubCommit,
    GitHubErrorJson
} from './model';
import { List } from 'immutable';

const apiPath = '/deploys-radiator/api';
export const getDeploys = (stage: string): Promise<List<DeployRecord>> => (
    fetch(`${apiPath}/deploys?projectName=dotcom:&stage=${stage}&pageSize=200`, { credentials: 'same-origin' })
        .then((response): Promise<DeploysJson> => response.json())
        .then(deploys => List(deploys.response.map(deploy => createDeployRecord({
            build: Number(deploy.build),
            uuid: deploy.uuid,
            projectName: deploy.projectName.replace(/^dotcom:/, ''),
            status: deploy.status,
            time: new Date(deploy.time)
        }))))
);

export const getBuild = (build: number): Promise<BuildRecord> => (
    fetch(`${apiPath}/builds/${build}`, { credentials: 'same-origin' })
        .then((response): Promise<BuildJson> => response.json())
        .then(build => build.response)
        .then(build => createBuildRecord({
            number: Number(build.number),
            projectName: build.projectName,
            revision: build.revision,
            commits: build.commits
        }))
);

const gitHubApiHost = 'https://api.github.com';
export const getDifference = (base: string, head: string): Promise<List<GitHubCommit>> => (
    fetch(`${gitHubApiHost}/repos/guardian/frontend/compare/${base}...${head}`, { headers: { 'Authorization': `token ${window.gitHubAccessToken}` } })
        .then((response: Response): Promise<List<GitHubCommit>> => {
            if (response.ok) {
                return response.clone().json<GitHubCompareJson>()
                    .then(json => json.commits)
                    .then(gitHubCommitsJson => List(gitHubCommitsJson.map((gitHubCommitJson): GitHubCommit => (
                        {
                            url: gitHubCommitJson.html_url,
                            authorName: gitHubCommitJson.commit.author.name,
                            authorLogin: (gitHubCommitJson.author) ? gitHubCommitJson.author.login : 'Unknown',
                            message: gitHubCommitJson.commit.message
                        }
                    ))));
            } else {
                return response.clone().json<GitHubErrorJson>()
                    // We need to re-assert the type for rejected promises
                    // https://github.com/Microsoft/TypeScript/issues/7588
                    .then(json => Promise.reject<List<GitHubCommit>>(new Error(json.message)));
            }
        })
);

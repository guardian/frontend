/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../manual-typings/es6-promise.d.ts" />
/// <reference path="../manual-typings/vdom-virtualize.d.ts" />
/// <reference path="../manual-typings/immutable.d.ts" />
/// <reference path="../manual-typings/custom-window.d.ts" />
/// <reference path="../jspm_packages/npm/monapt@0.5.0/dist/monapt.d.ts" />

import { diff, patch, h, create } from 'virtual-dom';
import {
    Deploy, DeployRecord, createDeployRecord,
    Build, BuildRecord, createBuildRecord,
    DeployGroup, DeployGroupRecord, createDeployGroupRecord,
    DeployJson, BuildJson, Commit,
    GitHubCompareJson, GitHubCommitJson, GitHubCommit,
    GitHubErrorJson
} from './model';
import { List, Map, Record, Iterable } from 'immutable';
import { Option, Some, None } from 'monapt';

const headOption = <A>(array: Array<A>): Option<A> => Option(array[0]);

const { fetch } = window;

// https://github.com/Matt-Esch/virtual-dom/issues/276
const ih =
    (tagName: string,
     options: VirtualDOM.createProperties,
     children: List<VirtualDOM.VNode>): VirtualDOM.VNode => (
        h(tagName, options, children.toJS())
    );

let currentTree = h('div', {}, []);
let rootNode = create(currentTree);
document.body.appendChild(rootNode);

const updateDom = (newTree: VirtualDOM.VNode): void => {
    const patches = diff(currentTree, newTree);
    rootNode = patch(rootNode, patches);
    currentTree = newTree;
};

// A started deploy is all except status "Not running"
// This is because a deploy is not transactional, so we can't
// be sure if the box has updated or not once the job has started.
const hasDeployStarted = (deploy: DeployRecord) => deploy.status !== 'Not running';

const getStartedDeploysFor = (projectName: String, deploys: List<DeployRecord>) => (
    deploys
        .filter(hasDeployStarted)
        .filter(deploy => deploy.projectName === projectName)
        .sort((a, b) => a.time.getTime() - b.time.getTime())
);

const isDeployMostRecent = (deploy: Deploy, deploys: List<DeployRecord>): boolean => {
    const mostRecent = getStartedDeploysFor(deploy.projectName, deploys).last();
    return mostRecent ? (deploy.uuid === mostRecent.uuid) : false;
};

const getMostRecentDeploys = (deploys: List<DeployRecord>): List<DeployRecord> => (
    deploys.filter(deploy => isDeployMostRecent(deploy, deploys)).toList()
);

// Used in hyperscript because children cannot be booleans
// https://github.com/Matt-Esch/virtual-dom/issues/326
const exp = (condition: boolean): boolean | void => condition ? true : undefined;

const teamCityHost = 'http://teamcity.gu-web.net:8111';
const createBuildLink = (build: number) => (
    `${teamCityHost}/viewLog.html?buildNumber=${build}&buildTypeId=dotcom_master&tab=buildResultsDiv`
);

const riffRaffHost = 'https://riffraff.gutools.co.uk';
const createRiffRaffDeployLink = (uuid: string) => (
    `${riffRaffHost}/deployment/view/${uuid}`
);

const renderGroupDeployListNode = (deploys: List<DeployRecord>) => {
    const previousDeploysMap =
        Map<DeployRecord, DeployRecord>(
            deploys.map(deploy =>
                [deploy, getStartedDeploysFor(deploy.projectName, deploys)
                    .filterNot(d => d.uuid === deploy.uuid)
                    .last()
                ]
            )
        );

    const currentDeploys = getMostRecentDeploys(deploys);
    const notRunningDeploys = deploys.filter(deploy => !hasDeployStarted(deploy)).toList();

    const renderGroupDeployNodes = (groupDeploys: List<DeployRecord>, deployGroup: DeployGroupRecord) => {
        const shouldShowProjectNames = !groupDeploys.equals(currentDeploys);

        return h(
            'li',
            { className: `deploy deploy--${deployGroup.status.split(' ').join('-').toLowerCase()}` },
            [
                h('h2', [
                    h('a', { href: createBuildLink(deployGroup.build) }, `${deployGroup.build}`)
                ]),
                // Only show project names if we have multiple deployed groups
                exp(shouldShowProjectNames) && ih('ul', {}, groupDeploys
                    .sortBy(build => build.projectName)
                    .map(deploy => {
                        const previousBuild = previousDeploysMap.get(deploy);
                        return h('li', [
                            h('a', {
                                href: createRiffRaffDeployLink(deploy.uuid),
                                title: previousBuild ? `Previous build: ${previousBuild.build}` : ''
                            }, deploy.projectName)
                        ]);
                    })
                    .toList()
                )
            ]
        );
    };

    const createDeployGroup = (deploys: List<DeployRecord>) => (
        deploys.groupBy(deploy => (
            createDeployGroupRecord({
                status: deploy.status,
                build: deploy.build
            })
        ))
    );

    const currentDeployGroupNodes = createDeployGroup(currentDeploys)
        .map(renderGroupDeployNodes)
        .toList();

    return h('div', {}, [
        ih('ul', { className: 'deploys' }, currentDeployGroupNodes),
        exp(notRunningDeploys.size > 0) && [
            h('h2', 'Queue'),
            ih('ul', {}, createDeployGroup(notRunningDeploys)
                .map((groupDeploys, deployGroup) => (
                    h('li', [
                        h('strong', [
                            h('a', { href: createBuildLink(deployGroup.build) }, deployGroup.build.toString())
                        ]),
                        ih('ul', {}, (
                            groupDeploys
                                .sortBy(build => build.projectName)
                                .map(deploy => {
                                    const previousBuild = previousDeploysMap.get(deploy);
                                    return h('li', [
                                        h('a', {
                                            href: createRiffRaffDeployLink(deploy.uuid),
                                            title: previousBuild ? `Previous build: ${previousBuild.build}` : ''

                                        }, deploy.projectName)
                                    ]);
                                })
                                .toList()
                        ))
                    ])
                ))
                .toList()
            )
        ]
    ]);
};

const renderPage: (
    deploysPair: [ List<DeployRecord>, List<DeployRecord> ],
    // TODO: Use tuple instead
    deployPair: Array<DeployRecord>,
    commits: Array<GitHubCommit>
) => VirtualDOM.VNode =
    (
        [ codeDeploys, prodDeploys ],
        [ latestCodeDeploy, oldestProdDeploy ],
        commits
    ) => {
        const isInSync = oldestProdDeploy.build === latestCodeDeploy.build;
        return h('div', { id: 'root' }, [
            h('h1', `Status: ${isInSync ? 'in sync. Ship it!' : 'out of sync.'}`),
            h('hr', {}, []),
            exp(commits.length > 0) && h('div', [
                h('h1', [
                    'Difference (',
                    h('span', { title: 'Oldest PROD deploy' }, `${oldestProdDeploy.build}`),
                    '...',
                    h('span', { title: 'Latest CODE deploy' }, `${latestCodeDeploy.build}`),
                    ')'
                ]),
                ih('ul', {}, (
                    commits
                        .reduce((accumulator: List<[string, List<GitHubCommit>]>, currentCommit: GitHubCommit, currentIndex: number): List<[string, List<GitHubCommit>]> => {
                            const isNotEmpty: boolean = ! accumulator.isEmpty();
                            const previousGroup = accumulator.last();
                            const maybePreviousAuthorName: Option<string> = isNotEmpty ? headOption(previousGroup) : None;
                            return maybePreviousAuthorName
                                .flatMap(previousAuthorName => {
                                    if (previousAuthorName === currentCommit.authorName) {
                                        const currentCommitsByAuthor = previousGroup[1];
                                        const index = accumulator.indexOf(previousGroup);
                                        return new Some(accumulator.set(index, [ previousAuthorName, currentCommitsByAuthor.push(currentCommit) ]))
                                    } else {
                                        return None;
                                    }
                                })
                                .getOrElse(() => accumulator.push([ currentCommit.authorName, List([ currentCommit ]) ]))
                        }, List<[string, List<GitHubCommit>]>())
                        .map(([ authorName, commits ]) => (
                            h('li', [
                                h('h2', authorName),
                                ih('ul', {}, (
                                    commits
                                        .map(commit => (
                                            h('li', [
                                                h('a', { href: commit.url }, headOption(commit.message.split('\n')).getOrElse(() => '')),
                                                ` by ${commit.authorName}`
                                            ]))
                                        )
                                        .toList()
                                ))
                            ])
                        ))
                        .toList()
                ))
            ]),

            h('h1', 'CODE'),
            renderGroupDeployListNode(codeDeploys),
            h('h1', 'PROD'),
            renderGroupDeployListNode(prodDeploys)
        ])
    }

const apiPath = '/deploys-radiator/api';
const getDeploys = (stage: string): Promise<List<DeployRecord>> => (
    fetch(`${apiPath}/deploys?projectName=dotcom:&stage=${stage}&pageSize=200`, { credentials: 'same-origin' })
        .then((response): Promise<Array<DeployJson>> => response.json())
        .then(deploys => List(deploys.map(deploy => createDeployRecord({
            build: Number(deploy.build),
            uuid: deploy.uuid,
            projectName: deploy.projectName.replace(/^dotcom:/, ''),
            status: deploy.status,
            time: new Date(deploy.time)
        }))))
);
const getBuild = (build: number): Promise<BuildRecord> => (
    fetch(`${apiPath}/builds/${build}`, { credentials: 'same-origin' })
        .then((response): Promise<BuildJson> => response.json())
        .then(build => createBuildRecord({
            number: Number(build.number),
            projectName: build.projectName,
            revision: build.revision,
            commits: build.commits
        }))
);

const gitHubApiHost = 'https://api.github.com';
const getDifference = (base: string, head: string): Promise<Array<GitHubCommit>> => (
    fetch(`${gitHubApiHost}/repos/guardian/frontend/compare/${base}...${head}`, { headers: { 'Authorization': `token ${window.gitHubAccessToken}` } })
        .then(response => {
            if (response.ok) {
                return response.clone().json<GitHubCompareJson>()
                    .then(json => json.commits)
                    .then(gitHubCommitsJson => gitHubCommitsJson.map((gitHubCommitJson): GitHubCommit => (
                        {
                            url: gitHubCommitJson.html_url,
                            authorName: gitHubCommitJson.commit.author.name,
                            message: gitHubCommitJson.commit.message
                        }
                    )));
            } else {
                return response.clone().json<GitHubErrorJson>()
                    .then(json => Promise.reject(new Error(json.message)));
            }
        })
);

const run = (): Promise<void> => {
    const deploysPromise = Promise.all([
        getDeploys('CODE'),
        getDeploys('PROD')
    ]);

    const deployRefsPromise = deploysPromise.then(([ codeDeploys, prodDeploys ]) => {
        const currentCodeDeploys = getMostRecentDeploys(codeDeploys);
        const currentProdDeploys = getMostRecentDeploys(prodDeploys);
        const latestCodeDeploy = currentCodeDeploys
            .sortBy(deploy => deploy.build)
            .last();
        const blacklistProdDeploys = List(['static', 'router', 'training-preview', 'facia-press']);
        const oldestProdDeploy = currentProdDeploys
            .filter(deploy => !blacklistProdDeploys.contains(deploy.projectName))
            .sortBy(deploy => deploy.build)
            .first();

        return [ latestCodeDeploy, oldestProdDeploy ];
    });

    const buildsPromise = deployRefsPromise.then(([ latestCodeDeploy, oldestProdDeploy ]) => (
        Promise.all([
            getBuild(latestCodeDeploy.build),
            getBuild(oldestProdDeploy.build),
        ])
    ));

    const differencePromise = buildsPromise.then(([ codeBuild, prodBuild ]) => (
        getDifference(prodBuild.revision, codeBuild.revision).then(gitHubCommits => gitHubCommits.reverse())
    ));

    return Promise.all([ deploysPromise, deployRefsPromise, differencePromise ])
        .then(([ deploysPair, deployPair, commits ]) => renderPage(deploysPair, deployPair, commits))
        .then(updateDom);
};


const intervalSeconds = 10;
const wait = (): Promise<{}> => new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
const update = (): Promise<void> => {
    return run()
        .then(wait, wait)
        .then(update);
};
update();

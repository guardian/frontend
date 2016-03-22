import { h } from 'virtual-dom';
import {
    DeployGroupRecord, DeployRecord, Deploy, GitHubCommit,
    createDeployGroupRecord, BuildRecord
} from './model';
import { List, Map, Record, Iterable } from 'immutable';
import { hasDeployStarted, getStartedDeploysFor, getMostRecentDeploys } from './model-helpers';
import { Option } from 'monapt';
import { headOption } from './helpers';

// https://github.com/Matt-Esch/virtual-dom/issues/276
const ih =
    (tagName: string,
     options: VirtualDOM.createProperties,
     children: List<VirtualDOM.VNode>): VirtualDOM.VNode => (
        h(tagName, options, children.toJS())
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
    const notRunningDeploysGroup = createDeployGroup(notRunningDeploys);

    return h('div', {}, [
        ih('ul', { className: 'deploys' }, currentDeployGroupNodes),
        exp(notRunningDeploys.size > 0) && [
            h('h2', 'Queue'),
            ih('ul', {}, notRunningDeploysGroup
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
    commits: List<GitHubCommit>,
    maybeLatestBuild: Option<BuildRecord>
) => VirtualDOM.VNode =
    (
        [ codeDeploys, prodDeploys ],
        [ latestCodeDeploy, oldestProdDeploy ],
        commits,
        maybeLatestBuild
    ) => {
        const isInSync = oldestProdDeploy.build === latestCodeDeploy.build;
        return h('.row#root', {}, [
            h('h1', [
                `Status: ${isInSync ? 'in sync. Ship it!' : 'out of sync.'}`
            ]),
            h('hr', {}, []),
            maybeLatestBuild
                .map(latestBuild => h('h2', {}, `Latest build: ${latestBuild.number}, ${latestBuild.state}, ${latestBuild.status}`))
                .getOrElse(() => undefined),
            exp(commits.size > 0) && h('.col', [
                h('h1', [
                    'Difference (',
                    h('span', { title: 'Oldest PROD deploy' }, `${oldestProdDeploy.build}`),
                    '...',
                    h('span', { title: 'Latest CODE deploy' }, `${latestCodeDeploy.build}`),
                    ')'
                ]),
                ih('ul', {}, (
                    commits
                        .groupBy(commit => commit.authorLogin)
                        .map(commits => headOption(commits.toArray()).map(commit => commit.authorName).getOrElse(() => ''))
                        .map(commitAuthorName => (
                            h('li', [
                                h('h2', commitAuthorName)
                            ])
                        ))
                        .toList()
                ))
            ]),

            h('.col', [
                h('h1', 'CODE'),
                renderGroupDeployListNode(codeDeploys)
            ]),
            h('.col', [
                h('h1', 'PROD'),
                renderGroupDeployListNode(prodDeploys)
            ])
        ])
    }

export default renderPage;

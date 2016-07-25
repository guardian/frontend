import { h } from 'virtual-dom';
import { createDeployGroupRecord } from './model';
import { Map } from 'immutable';
import { Option } from 'monapt';
import { hasDeployStarted, getStartedDeploysFor, getMostRecentDeploys } from './model-helpers';

const headOption = (array) => Option(array[0]);
// https://github.com/Matt-Esch/virtual-dom/issues/276
const ih = (tagName, options, children) => (h(tagName, options, children.toJS()));
// Used in hyperscript because children cannot be booleans
// https://github.com/Matt-Esch/virtual-dom/issues/326
const exp = (condition) => condition ? true : undefined;
const teamCityHost = 'http://teamcity.gu-web.net:8111';
const createBuildLink = (build) => (`${teamCityHost}/viewLog.html?buildNumber=${build}&buildTypeId=dotcom_master&tab=buildResultsDiv`);
const riffRaffHost = 'https://riffraff.gutools.co.uk';
const createRiffRaffDeployLink = (uuid) => (`${riffRaffHost}/deployment/view/${uuid}`);
const renderGroupDeployListNode = (deploys) => {
    const previousDeploysMap = Map(deploys.map(deploy => [deploy, getStartedDeploysFor(deploy.projectName, deploys)
        .filterNot(d => d.uuid === deploy.uuid)
        .last()
    ]));
    const currentDeploys = getMostRecentDeploys(deploys);
    const notRunningDeploys = deploys.filter(deploy => !hasDeployStarted(deploy)).toList();
    const renderGroupDeployNodes = (groupDeploys, deployGroup) => {
        const shouldShowProjectNames = !groupDeploys.equals(currentDeploys);
        return h('li', {
            className: `deploy deploy--${deployGroup.status.split(' ').join('-').toLowerCase()}`
        }, [
            h('h2', [
                h('a.number', {
                    href: createBuildLink(deployGroup.build)
                }, `${deployGroup.build}`)
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
                .toList())
        ]);
    };
    const createDeployGroup = (deploys) => (deploys.groupBy(deploy => (createDeployGroupRecord({
        status: deploy.status,
        build: deploy.build
    }))));
    const currentDeployGroupNodes = createDeployGroup(currentDeploys)
        .map(renderGroupDeployNodes)
        .toList();
    const notRunningDeploysGroup = createDeployGroup(notRunningDeploys);
    return h('div', {}, [
        ih('ul', {
            className: 'deploys'
        }, currentDeployGroupNodes),
        exp(notRunningDeploys.size > 0) && [
            h('h2', 'Queue'),
            ih('ul', {}, notRunningDeploysGroup
                .map((groupDeploys, deployGroup) => (h('li', [
                    h('strong', [
                        h('a', {
                            href: createBuildLink(deployGroup.build)
                        }, deployGroup.build.toString())
                    ]),
                    ih('ul', {}, (groupDeploys
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
                        .toList()))
                ])))
                .toList())
        ]
    ]);
};
const renderPage = ([codeDeploys, prodDeploys], [latestCodeDeploy, oldestProdDeploy], commits) => {
    const isInSync = oldestProdDeploy.build === latestCodeDeploy.build && !hasDeployStarted(oldestProdDeploy) && !hasDeployStarted(latestCodeDeploy);
    return h(`${exp(commits.size == 0) ? '.unsynced' : ''}.row#root`, {}, [
        h('h1', [
            `${isInSync ? '🌷👌' : '🔥 ship it!'}`
        ]),
        h('.col', [
            h('h1', 'code'),
            renderGroupDeployListNode(codeDeploys)
        ]),
        exp(commits.size > 0) && h('.col.builds', [
            h('h1', [
                'waiting…'
            ]),
            ih('ul', {}, (commits
                .groupBy(commit => commit.authorLogin)
                .map(commits => headOption(commits.toArray()).map(commit => commit.authorName).getOrElse(() => ''))
                .map(commitAuthorName => (h('li', [
                    h('h2', commitAuthorName)
                ])))
                .toList()))
        ]),
        h('.col', [
            h('h1', 'prod'),
            renderGroupDeployListNode(prodDeploys)
        ])
    ]);
};
export default renderPage;

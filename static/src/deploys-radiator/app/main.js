import { diff, patch, h, create } from 'virtual-dom';
import { List } from 'immutable';

import renderPage from './render';
import { getDeploys, getBuild, getDifference } from './api';
import { getMostRecentDeploys } from './model-helpers';

let currentTree = h('div', {}, []);
let rootNode = create(currentTree);
document.body.appendChild(rootNode);

const updateDom = (newTree) => {
    const patches = diff(currentTree, newTree);
    rootNode = patch(rootNode, patches);
    currentTree = newTree;
};
const run = () => {
    // We only care about servers which are deployed frequently and manually
    // with goo
    const serverWhitelist = List([
        'admin',
        'admin-jobs',
        'applications',
        'archive',
        'article',
        'commercial',
        'diagnostics',
        'discussion',
        'facia',
        'facia-press',
        'identity',
        'onward',
        'preview',
        'rss',
        'sport',
    ]);
    const unifiedWhitelist = List([
        'all',
    ]);
    const filterWhiteListed = whitelist => deploys => deploys
        .filter(deploy => whitelist.contains(deploy.projectName))
        .toList();
    const filterServer = filterWhiteListed(serverWhitelist);
    const filterUnified = filterWhiteListed(unifiedWhitelist);
    const timeOfMostRecent = deploys => getMostRecentDeploys(deploys).last().time.getTime();
    const mostRecentOf = (serverDeploys, unifiedDeploys) => {
        if (serverDeploys.isEmpty()) return unifiedDeploys;
        if (unifiedDeploys.isEmpty()) return serverDeploys;
        const serverTime = timeOfMostRecent(serverDeploys);
        const unifiedTime = timeOfMostRecent(unifiedDeploys);
        return (serverTime > unifiedTime) ? serverDeploys : unifiedDeploys;
    };
    const deploysPromise = Promise.all([
        getDeploys('CODE'),
        getDeploys('PROD'),
    ]);
    const filteredDeploysPromise = deploysPromise.then(([codeDeploys, prodDeploys]) => {
        const currentCodeDeploys = mostRecentOf(filterServer(codeDeploys), filterUnified(codeDeploys));
        const currentProdDeploys = mostRecentOf(filterServer(prodDeploys), filterUnified(prodDeploys));
        return [currentCodeDeploys, currentProdDeploys];
    });
    const latestDeploysPromise = filteredDeploysPromise.then(([codeDeploys, prodDeploys]) => {
        const currentCodeDeploys = getMostRecentDeploys(codeDeploys);
        const currentProdDeploys = getMostRecentDeploys(prodDeploys);
        const latestCodeDeploy = currentCodeDeploys
            .sortBy(deploy => deploy.build)
            .last();
        const oldestProdDeploy = currentProdDeploys
            .sortBy(deploy => deploy.build)
            .first();
        return [latestCodeDeploy, oldestProdDeploy];
    });
    const buildsPromise = latestDeploysPromise.then(([latestCodeDeploy, oldestProdDeploy]) => (Promise.all([
        getBuild(latestCodeDeploy.build),
        getBuild(oldestProdDeploy.build),
    ])));
    const differencePromise = buildsPromise.then(([codeBuild, prodBuild]) => (getDifference(prodBuild.revision, codeBuild.revision).then(gitHubCommits => gitHubCommits.reverse().toList())));
    return Promise.all([filteredDeploysPromise, latestDeploysPromise, differencePromise])
        .then(([deploysPair, deployPair, commits]) => renderPage(deploysPair, deployPair, commits))
        .then(updateDom);
};
const intervalSeconds = 10;
const wait = () => new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
const update = () => run()
    .then(wait, (error) => {
        console.error('Handled promise rejection.', error.stack); // eslint-disable-line no-console
        return wait();
    })
    .then(update);
update();

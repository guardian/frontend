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
        'applications',
        'archive',
        'article',
        'commercial',
        'diagnostics',
        'discussion',
        'facia',
        'identity',
        'onward',
        'sport'
    ]);
    const filterWhitelisted = (deploys) => deploys
        .filter(deploy => serverWhitelist.contains(deploy.projectName))
        .toList();
    const deploysPromise = Promise.all([
        getDeploys('CODE').then(filterWhitelisted),
        getDeploys('PROD').then(filterWhitelisted)
    ]);
    const latestDeploysPromise = deploysPromise.then(([codeDeploys, prodDeploys]) => {
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
    return Promise.all([deploysPromise, latestDeploysPromise, differencePromise])
        .then(([deploysPair, deployPair, commits]) => renderPage(deploysPair, deployPair, commits))
        .then(updateDom);
};
const intervalSeconds = 10;
const wait = () => new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
const update = () => {
    return run()
        .then(wait, (error) => {
            console.error('Handled promise rejection.', error.stack);
            return wait();
        })
        .then(update);
};
update();

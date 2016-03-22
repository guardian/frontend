/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../manual-typings/vdom-virtualize.d.ts" />
/// <reference path="../manual-typings/immutable.d.ts" />
/// <reference path="../manual-typings/custom-window.d.ts" />
/// <reference path="../jspm_packages/npm/monapt@0.5.0/dist/monapt.d.ts" />

import { VPatch, diff, patch, h, create } from 'virtual-dom';
import { List, Map, Record, Iterable } from 'immutable';
import renderPage from './render';
import { getDeploys, getBuild, getDifference, getBuilds } from './api';
import { DeployRecord, BuildRecord } from './model';
import { getMostRecentDeploys } from './model-helpers';
import { headOption } from './helpers';
import { Option } from 'monapt';

let currentTree = h('div', {}, []);
let rootNode: Element = create(currentTree);
document.body.appendChild(rootNode);

const updateDom = (newTree: VirtualDOM.VNode): void => {
    const patches: VPatch[] = diff(currentTree, newTree);
    rootNode = patch(rootNode, patches);
    currentTree = newTree;
};

const run = (): Promise<void> => {
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

    const filterWhitelisted = (deploys: List<DeployRecord>) => deploys
        .filter(deploy => serverWhitelist.contains(deploy.projectName))
        .toList();
    const deploysPromise: Promise<[List<DeployRecord>, List<DeployRecord>]> = Promise.all([
        getDeploys('CODE').then(filterWhitelisted),
        getDeploys('PROD').then(filterWhitelisted)
    ]);

    const latestDeploysPromise = deploysPromise.then(([ codeDeploys, prodDeploys ]) => {
        const currentCodeDeploys = getMostRecentDeploys(codeDeploys);
        const currentProdDeploys = getMostRecentDeploys(prodDeploys);

        const latestCodeDeploy = currentCodeDeploys
            .sortBy(deploy => deploy.build)
            .last();
        const oldestProdDeploy = currentProdDeploys
            .sortBy(deploy => deploy.build)
            .first();

        return [ latestCodeDeploy, oldestProdDeploy ];
    });

    const buildsPromise = latestDeploysPromise.then(([ latestCodeDeploy, oldestProdDeploy ]) => (
        Promise.all([
            getBuild(latestCodeDeploy.build),
            getBuild(oldestProdDeploy.build),
        ])
    ));

    const differencePromise = buildsPromise.then(([ codeBuild, prodBuild ]) => (
        getDifference(prodBuild.revision, codeBuild.revision).then(gitHubCommits => gitHubCommits.reverse().toList())
    ));

    const latestBuildPromise: Promise<Option<BuildRecord>> = getBuilds().then(builds => headOption(builds.toJS()));

    return Promise.all([ deploysPromise, latestDeploysPromise, differencePromise, latestBuildPromise ])
        .then(([ deploysPair, deployPair, commits, latestBuild ]) => renderPage(deploysPair, deployPair, commits, latestBuild))
        .then(updateDom);
};

const intervalSeconds = 10;
const wait = (): Promise<{}> => new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
interface Error {
    stack: string;
}
const update = (): Promise<void> => {
    return run()
        .then(wait, (error: Error) => {
            console.error('Handled promise rejection.', error.stack);
            return wait();
        })
        .then(update);
};
update();

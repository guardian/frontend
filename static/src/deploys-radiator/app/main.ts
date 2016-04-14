// TODO: No recent deploys of router so it doesn't appear!! Increase history
// size or filter exact matches only
// TODO: Deal with error JSON
// TODO: Show status if updates fail
// TODO: Show build ID beside merge commits.
// - We currently only request the build for the most recent CODE/PROD deploys.
// We would have to request all builds in the range
// http://teamcity.gu-web.net:8111/guestAuth/app/rest/buildTypes/id:dotcom_master/builds?locator=sinceBuild:(number:1205),untilBuild:(number:1209)&fields=build(number,buildType(name,projectName),revisions(revision(version)),changes(change(username,comment,version)),artifact-dependencies(build(number)))
// TODO: Show failed deploys. Update status to say so
// TODO: Show upcoming deploys? Flow chart?
// Draw out requests

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

    const maybeLatestSuccessfulBuildPromise: Promise<Option<BuildRecord>> =
        getBuilds().then(builds => (
            Option(
                builds
                    .filter(build => build.status === 'SUCCESS')
                    .first()
            )
        ));

    const differencePromise =
        maybeLatestSuccessfulBuildPromise.then(maybeLatestSuccessfulBuild => (
            buildsPromise.then(([ codeBuild, prodBuild ]) => (
                maybeLatestSuccessfulBuild
                    .map(latestSuccessfulBuild => (
                        getDifference(prodBuild.revision, latestSuccessfulBuild.revision)
                            .then(gitHubCommits => gitHubCommits.reverse().toList())
                    ))
                    .getOrElse(() => Promise.resolve(List()))
            ))
        ));

    return Promise.all([deploysPromise, latestDeploysPromise, differencePromise, maybeLatestSuccessfulBuildPromise])
            .then(([deploysPair, deployPair, commits, maybeLatestSuccessfulBuild]) => renderPage(deploysPair, deployPair, commits, maybeLatestSuccessfulBuild))
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

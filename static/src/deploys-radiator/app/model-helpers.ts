import { DeployRecord, Deploy } from './model';
import { List } from 'immutable';

// A started deploy is all except status "Not running"
// This is because a deploy is not transactional, so we can't
// be sure if the box has updated or not once the job has started.
export const hasDeployStarted = (deploy: DeployRecord) => deploy.status !== 'Not running';

export const getStartedDeploysFor = (projectName: String, deploys: List<DeployRecord>) => (
    deploys
        .filter(hasDeployStarted)
        .filter(deploy => deploy.projectName === projectName)
        .sort((a, b) => a.time.getTime() - b.time.getTime())
);

export const isDeployMostRecent = (deploy: Deploy, deploys: List<DeployRecord>): boolean => {
    const mostRecent = getStartedDeploysFor(deploy.projectName, deploys).last();
    return mostRecent ? (deploy.uuid === mostRecent.uuid) : false;
};

export const getMostRecentDeploys = (deploys: List<DeployRecord>): List<DeployRecord> => (
    deploys.filter(deploy => isDeployMostRecent(deploy, deploys)).toList()
);

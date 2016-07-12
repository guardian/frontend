// A started deploy is all except status "Not running"
// This is because a deploy is not transactional, so we can't
// be sure if the box has updated or not once the job has started.
export const hasDeployStarted = (deploy) => deploy.status !== 'Not running';
export const getStartedDeploysFor = (projectName, deploys) => (deploys
    .filter(hasDeployStarted)
    .filter(deploy => deploy.projectName === projectName)
    .sort((a, b) => a.time.getTime() - b.time.getTime()));
export const isDeployMostRecent = (deploy, deploys) => {
    const mostRecent = getStartedDeploysFor(deploy.projectName, deploys).last();
    return mostRecent ? (deploy.uuid === mostRecent.uuid) : false;
};
export const getMostRecentDeploys = (deploys) => (deploys.filter(deploy => isDeployMostRecent(deploy, deploys)).toList());

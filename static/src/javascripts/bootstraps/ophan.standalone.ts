// Monkey patch to facilitate the removal of ophan tracking from the commercial bundle sent to DCR.

const ophan: Ophan = window.guardian.ophan;
// TODO: use federated modules
// || ((await import('ophan-tracker-js')) as Ophan);

// eslint-disable-next-line import/no-default-export -- it’s the Ophan way
export default ophan;

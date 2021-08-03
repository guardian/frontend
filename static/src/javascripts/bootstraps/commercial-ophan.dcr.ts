// Monkey patch to facilitate the removal of ophan tracking from the commercial bundle sent to DCR.

// const ophan: Ophan = window.guardian.config.isDotcomRendering
// 	? window.guardian.ophan
// 	: // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires -- we know
// 	  (require('ophan-tracker-js').default as Ophan);

const ophan = window.guardian.ophan;

// eslint-disable-next-line import/no-default-export -- it’s the Ophan way
export default ophan;

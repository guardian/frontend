
export const auxiaSignInGate = {
	id: 'AuxiaSignInGate',
	start: '2025-01-23',
	expiry: '2026-01-30',
	author: 'Pascal (Growth Team)',
	description: 'R&D Experiment: using Auxia API to drive the behavior of the SignIn gate',
	audience: 0.2,
	audienceOffset: 0,
	successMeasure: '',
	audienceCriteria: '',
	ophanComponentId: 'auxia_signin_gate',
	dataLinkNames: 'AuxiaSignInGate',
	idealOutcome: '',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'auxia-signin-gate',
			test: () => {},
		},
	],
};

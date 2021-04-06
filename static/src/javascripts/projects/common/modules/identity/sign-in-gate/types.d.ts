type CurrentABTest = {
	name: string;
	variant: string;
};

type ComponentEventParams = {
	componentType: string;
	componentId?: string;
	abTestName: string;
	abTestVariant: string;
	viewId: string;
	browserId?: string;
	visitId?: string;
};

type DismissalWindow = 'day' | 'dev';
type GateStatus = boolean | 'dismissed' | 'signed in';

type SignInGateVariant = {
	show: (arg0: {
		abTest: CurrentABTest;
		guUrl: string;
		signInUrl: string;
		ophanComponentId: string;
	}) => boolean;
	canShow: (name?: string) => boolean;
	name: string;
};

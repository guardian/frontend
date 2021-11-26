export const isGoogleProxy = (): boolean =>
	Boolean(
		navigator.userAgent.includes('Google Web Preview') ||
			navigator.userAgent.includes('googleweblight'),
	);

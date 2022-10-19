let supportsPushState: boolean | undefined;

// simulate type of window from older browsers
type OldWindow = Omit<Window, 'history'> & {
	history?: Omit<History, 'pushState' | 'replaceState'> & {
		pushState?: History['pushState'];
		replaceState?: History['replaceState'];
	};
};

const _window = window as OldWindow;

const hasPushStateSupport = (): boolean => {
	if (supportsPushState !== undefined) {
		return supportsPushState;
	}

	if (_window.history?.pushState) {
		supportsPushState = true;
		// Android stock browser lies about its HistoryAPI support.
		if (/Android/i.exec(window.navigator.userAgent)) {
			supportsPushState = !!/(Chrome|Firefox)/i.exec(
				window.navigator.userAgent,
			);
		}
		return supportsPushState;
	}
	return false;
};

export { hasPushStateSupport };

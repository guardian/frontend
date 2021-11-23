export const postMessage = (
	message: {
		id: string;
		[key: string]: unknown;
	},
	targetWindow: MessageEventSource | null,
	options: WindowPostMessageOptions = {
		targetOrigin: '*',
	},
): void => {
	targetWindow?.postMessage(JSON.stringify(message), options);
};

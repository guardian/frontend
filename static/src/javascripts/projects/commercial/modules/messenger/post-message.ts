export const postMessage = (
	message: Record<string, unknown>,
	target: MessageEventSource,
	targetOrigin = '*',
): void => {
	target.postMessage(JSON.stringify(message), { targetOrigin });
};

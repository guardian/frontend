export const postMessage = (
	message: Record<string, unknown>,
	target: MessageEventSource,
	targetOrigin?: string,
): void => {
	const postMessageOptions = targetOrigin ? { targetOrigin } : {};
	target.postMessage(JSON.stringify(message), postMessageOptions);
};

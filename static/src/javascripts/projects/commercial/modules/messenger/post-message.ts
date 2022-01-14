export const postMessage = (
	message: Record<string, unknown>,
	target: MessageEventSource,
	targetOrigin?: string | null | undefined,
): void => {
	target.postMessage(JSON.stringify(message), {
		targetOrigin: targetOrigin ?? '*',
	});
};

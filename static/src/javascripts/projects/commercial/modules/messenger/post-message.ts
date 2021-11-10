export const postMessage = (
	message: Record<string, unknown>,
	targetWindow: WindowProxy,
	targetOrigin?: string | null | undefined,
): void => {
	targetWindow.postMessage(JSON.stringify(message), targetOrigin ?? '*');
};

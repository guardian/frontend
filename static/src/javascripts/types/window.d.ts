declare global {
    interface Window {
        requestIdleCallback?: (arg0: () => void) => void;
        ApplePaySession?: ApplePaySession;
     }
}

export { }

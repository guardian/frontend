// @flow

type Feature = {
    icon: ?string,
    mainCopy: string,
    subCopy: string,
};

type LinkTargets = {
    signIn: string,
    register: string,
    why?: string,
};

type MainTemplate = {
    headerMain: string[],
    headerSub: string[],
    signInCta: string,
    registerCta: string,
    advantagesCta: string,
    closeButton: string,
    features: Feature[],
    links: LinkTargets,
};

type DismissalReason = {
    key: string,
    label: string,
};

type FeedbackTemplate = {
    headerMain: string,
    headerSub: string,
    reasonsWhy: DismissalReason[],
    submitCta: string,
    closeButton: string,
};

const bindableClassNames = {
    closeBtn: 'js-site-message--sign-in__dismiss',
};

export type {
    LinkTargets,
    Feature,
    MainTemplate,
    FeedbackTemplate,
    DismissalReason,
};
export { bindableClassNames };

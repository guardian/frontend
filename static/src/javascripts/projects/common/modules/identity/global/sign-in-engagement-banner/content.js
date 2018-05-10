// @flow
import config from 'lib/config';

import iconComment from 'svgs/icon/comment-16.svg';
import iconEmail from 'svgs/icon/mail.svg';
import iconPhone from 'svgs/icon/device.svg';

import { makeTemplateHtml as makeMainTemplateHtml } from './html.main.js';
import { makeTemplateHtml as makeFeedbackTemplateHtml } from './html.feedback.js';

import type {
    LinkTargets,
    Feature,
    MainTemplate,
    FeedbackTemplate,
    DismissalReason,
} from './template';

const links: LinkTargets = {
    signIn: `${config.get(
        'page.idUrl'
    )}/signin?cmp=sign-in-eb&utm_campaign=sign-in-eb`,
    register: `${config.get(
        'page.idUrl'
    )}/register?cmp=sign-in-eb&utm_campaign=sign-in-eb`,
    why: 'https://www.theguardian.com/why-sign-in-to-the-guardian',
};

const features: Feature[] = [
    {
        icon: iconComment.markup,
        mainCopy: 'Join the conversation',
        subCopy: 'and comment on articles',
    },
    {
        icon: iconEmail.markup,
        mainCopy: 'Get closer to the journalism',
        subCopy: 'by subscribing to editorial&nbsp;emails',
    },
    {
        icon: iconPhone.markup,
        mainCopy: 'A consistent experience',
        subCopy: 'across all of your devices',
    },
];

const mainTpl: MainTemplate = {
    headerMain: ['Enjoy even', 'more', 'from', 'The&nbsp;Guardian'],
    headerSub: ['Please sign in or register to manage your preferences'],
    signInCta: 'Sign in',
    registerCta: 'Register',
    advantagesCta: 'Why sign in to The Guardian?',
    closeButton: 'Continue without signing in',
    features,
    links,
};

const feedbackDismissalReasons: DismissalReason[] = [
    {
        key: 'no-benefit',
        label: "There's no benefit to signing in",
    },
    {
        key: 'dont-want-to-share-personal-details',
        label: "I don't want to share personal details",
    },
    {
        key: 'dont-have-time',
        label: "I don't have time right now",
    },
    {
        key: 'too-much-hassle',
        label: "It's too much hassle",
    },
    {
        key: 'none-of-the-above',
        label: 'None of the above',
    },
];

const feedbackTpl: FeedbackTemplate = {
    headerMain: 'Please leave feedback to help us improve',
    headerSub: `I don't want to sign in or register because:`,
    reasonsWhy: feedbackDismissalReasons,
    submitCta: 'Submit your feedback',
};

const mainHtml = makeMainTemplateHtml(mainTpl);
const feedbackHtml = makeFeedbackTemplateHtml(feedbackTpl);

export { mainHtml, feedbackHtml };

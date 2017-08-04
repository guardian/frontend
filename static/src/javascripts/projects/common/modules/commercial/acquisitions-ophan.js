// @flow
import ophan from 'ophan/ng';

type OphanComponentType =
    | 'READERS_QUESTIONS_ATOM'
    | 'QANDA_ATOM'
    | 'PROFILE_ATOM'
    | 'GUIDE_ATOM'
    | 'TIMELINE_ATOM'
    | 'NEWSLETTER_SUBSCRIPTION'
    | 'SURVEYS_QUESTIONS'
    | 'ACQUISITIONS_EPIC'
    | 'ACQUISITIONS_ENGAGEMENT_BANNER';

type OphanComponentEvent = {
    component: {
        type: OphanComponentType,
    },
};

export const submitEpicInsertEvent = () => {
    const event: OphanComponentEvent = {
        component: {
            type: 'ACQUISITIONS_EPIC',
        },
    };

    ophan.record({
        componentEvent: event,
    });
};

export const submitEpicViewEvent = () => {};

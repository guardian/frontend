// @flow strict
import config from 'lib/config';

const onLoad = () => {
    const handleQuerySurveyDone = (
        surveyAvailable: boolean,
        survey: { measurementId: string }
    ) => {
        if (surveyAvailable) {
            if (window && window.googletag) {
                window.googletag.cmd.push(() => {
                    window.googletag.pubads().setTargeting('inizio', 't');
                });
            }
            console.log(`surveyAvailable: ${survey.measurementId}`);
        }
    };
    // eslint-disable-next-line no-underscore-dangle
    window._brandmetrics = window._brandmetrics || [];
    // eslint-disable-next-line no-underscore-dangle
    window._brandmetrics.push({
        cmd: '_querySurvey',
        val: {
            callback: handleQuerySurveyDone,
        },
    });
};

export const inizio: ThirdPartyTag = {
    shouldRun: config.get('switches.inizio', false),
    url:
        '//cdn.brandmetrics.com/survey/script/e96d04c832084488a841a06b49b8fb2d.js',
    onLoad,
};

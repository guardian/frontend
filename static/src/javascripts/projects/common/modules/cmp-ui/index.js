// @flow
import { ConsentManagementPlatform } from '@guardian/consent-management-platform/lib/ConsentManagementPlatform';
import React from 'react';
import ReactDOM from 'react-dom';
import reportError from 'lib/report-error';
import { setErrorHandler } from '@guardian/consent-management-platform';

export const init = (forceModal: boolean) => {
    const container = document.createElement('div');
    container.id = 'cmpContainer';

    const props: {
        onClose: () => void,
        source: string,
        variant?: string,
        fontFamilies: {
            headlineSerif: string,
            bodySerif: string,
            bodySans: string,
        },
        forceModal: boolean,
    } = {
        onClose: () => {
            ReactDOM.unmountComponentAtNode(container);
        },
        source: 'www',
        fontFamilies: {
            headlineSerif: "'Guardian Egyptian Web', Georgia, serif",
            bodySerif: "'Guardian Text Egyptian Web', Georgia, serif",
            bodySans:
                "'Guardian Text Sans Web', Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif",
        },
        variant: 'CommercialCmpUiBannerModal-variant',
        forceModal,
    };

    if (document.body) {
        document.body.appendChild(container);
    }

    // setErrorHandler takes function to be called on errors in the CMP UI
    setErrorHandler(
        (errMsg: string): void => {
            const err = new Error(errMsg);

            reportError(
                err,
                {
                    feature: 'cmp',
                },
                false
            );
        }
    );

    ReactDOM.render(<ConsentManagementPlatform {...props} />, container);
};

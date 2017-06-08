// @flow

import epicControlTemplate
    from 'raw-loader!common/views/acquisitions-epic-control.html';
import lodashTemplate from 'lodash/utilities/template';
import {
    postElectionResults as postElectionResultsCopy,
} from 'common/modules/commercial/acquisitions-copy';

export const template = (variant: Variant) =>
    lodashTemplate(epicControlTemplate, {
        copy: postElectionResultsCopy,
        membershipUrl: variant.options && variant.options.membershipURL,
        contributionUrl: variant.options && variant.options.contributeURL,
        componentName: variant.options && variant.options.componentName,
        testimonialBlock: '',
    });

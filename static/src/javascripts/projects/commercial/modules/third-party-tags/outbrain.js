// @flow
import { adblockInUse } from 'lib/detect';
import { waitForCheck } from 'common/modules/check-mediator';
import { load } from './outbrain-load';

/*
 Outbrain loading behaviour follows the truth table below. This module uses a number of checks
 to determine what kind of outbrain component to show, if any.

 outbrain | no high-merch slot OR | high priority ad | low priority ad | contributions | email   | story     |  outbrain
 enabled  | ad blocker enabled    | loaded           | loaded          | ab test       | ab test | question  |  decision
---------------------------------------------------------------------------------------------------------------------------
  false             n/a                 n/a               n/a              n/a           n/a        n/a       no-outbrain
  true              true                n/a               n/a              false         false      false     compliant
  true              true                n/a               n/a              true          n/a        n/a       non-compliant
  true              true                n/a               n/a              false         true       n/a       non-compliant
  true              true                n/a               n/a              false         false      true      non-compliant
  true              false               true              true             n/a           n/a        n/a       no-outbrain
  true              false               true              false            n/a           n/a        n/a       merchandising
  true              false               false             n/a              true          n/a        n/a       non-compliant
  true              false               false             n/a              false         true       n/a       non-compliant
  true              false               false             n/a              false         false      true      non-compliant
  true              false               false             n/a              false         false      false     compliant
*/

const canLoadInstantly = () =>
    // Loading Outbrain is dependent on successful return of high relevance component
    // from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
    // not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
    // make the call instantly when we detect adBlock in use.
    adblockInUse.then(
        isUse => !document.getElementById('dfp-ad--merchandising-high') || isUse
    );

const onIsStoryQuestionsOnPage = isStoryQuestionsOnPage => {
    if (isStoryQuestionsOnPage) {
        load('nonCompliant');
    } else {
        load();
    }

    return Promise.resolve();
};

const onIsUserInEmailAbTestAndEmailCanRun = userInEmailAbTestAndEmailCanRun => {
    if (userInEmailAbTestAndEmailCanRun) {
        load('nonCompliant');
        return Promise.resolve();
    }

    return waitForCheck('isStoryQuestionsOnPage').then(
        onIsStoryQuestionsOnPage
    );
};

const onIsUserInContributionsAbTest = userInContributionsAbTest => {
    if (userInContributionsAbTest) {
        load('nonCompliant');
        return Promise.resolve();
    }

    return waitForCheck('isUserInEmailAbTestAndEmailCanRun').then(
        onIsUserInEmailAbTestAndEmailCanRun
    );
};

const onIsOutbrainMerchandiseCompliant = outbrainMerchandiseCompliant => {
    if (outbrainMerchandiseCompliant) {
        load('merchandising');
        return Promise.resolve();
    }

    return waitForCheck('isUserInContributionsAbTest').then(
        onIsUserInContributionsAbTest
    );
};

const onIsOutbrainBlockedByAds = outbrainBlockedByAds => {
    if (outbrainBlockedByAds) {
        return Promise.resolve();
    }

    return waitForCheck('isOutbrainMerchandiseCompliant').then(
        onIsOutbrainMerchandiseCompliant
    );
};

const onCanLoadInstantly = loadInstantly => {
    if (loadInstantly) {
        return waitForCheck('isUserInContributionsAbTest').then(
            onIsUserInContributionsAbTest
        );
    }

    return waitForCheck('isOutbrainBlockedByAds').then(
        onIsOutbrainBlockedByAds
    );
};

const onIsOutbrainDisabled = outbrainDisabled => {
    if (outbrainDisabled) {
        return Promise.resolve();
    }

    return canLoadInstantly().then(onCanLoadInstantly);
};

export const initOutbrain = () =>
    waitForCheck('isOutbrainDisabled').then(onIsOutbrainDisabled);

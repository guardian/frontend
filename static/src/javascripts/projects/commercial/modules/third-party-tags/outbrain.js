// @flow strict
import { adblockInUse } from 'lib/detect';
import { waitForCheck } from 'common/modules/check-mediator';
import config from 'lib/config';
import { load } from './outbrain-load';

type OutbrainPageConditions = {
    outbrainEnabled: boolean,
    noMerchSlotsExpected: boolean,
    contributionsTestVisible: boolean,
    storyQuestionsVisible: boolean,
};

type OutbrainDfpConditions = {
    blockedByAds: boolean,
    useMerchandiseAdSlot: boolean,
};

const noMerchSlotsExpected = (): Promise<boolean> =>
    // Loading Outbrain is dependent on successful return of high relevance component
    // from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
    // not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
    // make the call instantly when we detect adBlock in use.
    adblockInUse.then(
        isUse =>
            !document.getElementById('dfp-ad--merchandising-high') || !!isUse
    );

// These are the on-page conditions which influence the outbrain load. We don't need to wait for DFP to find the value of these.
const getOutbrainPageConditions = (): Promise<OutbrainPageConditions> =>
    Promise.all([
        waitForCheck('isOutbrainDisabled'),
        noMerchSlotsExpected(),
        waitForCheck('isUserInContributionsAbTest'),
        waitForCheck('isStoryQuestionsOnPage'),
    ]).then(([outbrainDisabled, noMerchSlots, contributions, story]) => ({
        outbrainEnabled: !outbrainDisabled,
        noMerchSlotsExpected: noMerchSlots,
        contributionsTestVisible: contributions,
        storyQuestionsVisible: story,
    }));

const getOutbrainDfpConditions = (): Promise<OutbrainDfpConditions> =>
    Promise.all([
        waitForCheck('isOutbrainBlockedByAds'),
        waitForCheck('isOutbrainMerchandiseCompliant'),
    ]).then(([blockedByAds, merchandiseCompliant]) => ({
        blockedByAds,
        useMerchandiseAdSlot: merchandiseCompliant,
    }));

export const getOutbrainComplianceTargeting = (): Promise<
    Map<string, string>
> =>
    getOutbrainPageConditions().then(pageConditions => {
        if (
            pageConditions.contributionsTestVisible ||
            pageConditions.storyQuestionsVisible ||
            !pageConditions.outbrainEnabled
        ) {
            // This key value should be read as "the outbrain load cannot be compliant"
            // (it could be non-compliant, or not loaded at all).
            return new Map([['outbrain-compliant', 'false']]);
        }
        return new Map();
    });

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

export const initOutbrain = (): Promise<void> =>
    getOutbrainPageConditions().then(pageConditions => {
        /*
            The `config.set` instances in this function are injecting debuging information into window.guardian.config.debug
            This will be used for investigations
        */

        config.set(
            'debug.outbrain.pageConditions.outbrainEnabled',
            pageConditions.outbrainEnabled
        );

        if (!pageConditions.outbrainEnabled) {
            return;
        }

        config.set(
            'debug.outbrain.pageConditions.contributionsTestVisible',
            pageConditions.contributionsTestVisible
        );
        config.set(
            'debug.outbrain.pageConditions.storyQuestionsVisible',
            pageConditions.storyQuestionsVisible
        );

        const contributionVisible = pageConditions.contributionsTestVisible;
        const editorialTests =
            contributionVisible || pageConditions.storyQuestionsVisible;

        config.set('debug.outbrain.editorialTests', editorialTests);
        config.set(
            'debug.outbrain.pageConditions.noMerchSlotsExpected',
            pageConditions.noMerchSlotsExpected
        );

        if (pageConditions.noMerchSlotsExpected) {
            if (editorialTests) {
                load('nonCompliant', contributionVisible);
            } else {
                load('defaults');
            }
        } else {
            // only wait for dfp conditions if we really have to.
            return getOutbrainDfpConditions().then(dfpConditions => {
                config.set(
                    'debug.outbrain.dfpConditions.blockedByAds',
                    dfpConditions.blockedByAds
                );

                if (dfpConditions.blockedByAds) {
                    return;
                }

                config.set(
                    'debug.outbrain.dfpConditions.useMerchandiseAdSlot',
                    dfpConditions.useMerchandiseAdSlot
                );

                if (dfpConditions.useMerchandiseAdSlot) {
                    load('merchandising');
                } else if (editorialTests) {
                    load('nonCompliant', contributionVisible);
                } else {
                    load('defaults');
                }
            });
        }
    });

// @flow
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import { getBreakpoint as getBreakpoint_ } from 'lib/detect';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import {
    isPayingMember as isPayingMember_,
    isRecentOneOffContributor as isRecentOneOffContributor_,
    shouldHideSupportMessaging as shouldHideSupportMessaging_,
    isAdFreeUser as isAdFreeUser_,
} from 'common/modules/commercial/user-features';

const isPayingMember: JestMockFn<*, *> = (isPayingMember_: any);
const isRecentOneOffContributor: JestMockFn<
    *,
    *
> = (isRecentOneOffContributor_: any);
const shouldHideSupportMessaging: JestMockFn<
    *,
    *
> = (shouldHideSupportMessaging_: any);
const isAdFreeUser: JestMockFn<*, *> = (isAdFreeUser_: any);
const getBreakpoint: any = getBreakpoint_;
const isUserLoggedIn: any = isUserLoggedIn_;

const CommercialFeatures = commercialFeatures.constructor;

jest.mock('common/modules/commercial/user-features', () => ({
    isPayingMember: jest.fn(),
    isRecentOneOffContributor: jest.fn(),
    shouldHideSupportMessaging: jest.fn(),
    isAdFreeUser: jest.fn(),
}));

jest.mock('lib/detect', () => ({
    getBreakpoint: jest.fn(),
}));

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));

describe('Commercial features', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        // Set up a happy path by default
        config.set('page', {
            contentType: 'Article',
            isMinuteArticle: false,
            section: 'politics',
            pageId: 'politics-article',
            shouldHideAdverts: false,
            shouldHideReaderRevenue: false,
            isFront: false,
            showRelatedContent: true,
        });

        config.set('switches', {
            plistaAu: true,
            commercial: true,
            enableDiscussionSwitch: true,
        });

        window.location.hash = '';

        userPrefs.removeSwitch('adverts');

        getBreakpoint.mockReturnValue('desktop');
        isPayingMember.mockReturnValue(false);
        isRecentOneOffContributor.mockReturnValue(false);
        shouldHideSupportMessaging.mockReturnValue(false);
        isAdFreeUser.mockReturnValue(false);
        isUserLoggedIn.mockReturnValue(true);

        expect.hasAssertions();
    });

    describe('DFP advertising', () => {
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(true);
        });

        it('Is disabled on sensitive pages', () => {
            // Like all newspapers, the Guardian must sometimes cover disturbing and graphic content.
            // Showing adverts on these pages would be crass - callous, even.
            config.set('page.shouldHideAdverts', true);
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(false);
        });

        it('Is disabled on the children`s book site', () => {
            // ASA guidelines prohibit us from showing adverts on anything that might be deemed childrens' content
            config.set('page.section', 'childrens-books-site');
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(false);
        });

        it('Is skipped for speedcurve tests', () => {
            // We don't want external dependencies getting in the way of perf tests
            window.location.hash = '#noads';
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(false);
        });

        it('Is disabled for speedcurve tests in ad-free mode', () => {
            window.location.hash = '#noadsaf';
            const features = new CommercialFeatures();
            expect(features.adFree).toBe(true);
            expect(features.dfpAdvertising).toBe(false);
        });
    });

    describe('Article body adverts', () => {
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(true);
        });

        it('Doesn`t run in minute articles', () => {
            config.set('page.isMinuteArticle', true);
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });

        it('Doesn`t run in non-article pages', () => {
            config.set('page.contentType', 'Network Front');
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });

        it('Doesn`t run in live blogs', () => {
            config.set('page.isLiveBlog', true);
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });
    });

    describe('Article body adverts under ad-free', () => {
        // LOL grammar
        it('are disabled', () => {
            isAdFreeUser.mockReturnValue(true);
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });
    });

    describe('High-relevance commercial component', () => {
        it('Does not run on fronts', () => {
            config.set('page.isFront', true);
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });

        it('Does run on outside of fronts', () => {
            config.set('page.isFront', false);
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(true);
        });

        it('Does not run on minute articles', () => {
            config.set('page.isMinuteArticle', true);
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });
    });

    describe('High-relevance commercial component under ad-free', () => {
        beforeEach(() => {
            isAdFreeUser.mockReturnValue(true);
        });

        it('Does not run on fronts', () => {
            config.set('page.isFront', true);
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });

        it('Does not run outside of fronts', () => {
            config.set('page.isFront', false);
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });

        it('Does not run on minute articles', () => {
            config.set('page.isMinuteArticle', true);
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });
    });

    describe('Third party tags', () => {
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(true);
        });

        it('Does not run on identity pages', () => {
            config.set('page.contentType', 'Identity');
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on identity section', () => {
            // This is needed for identity pages in the profile subdomain
            config.set('page.section', 'identity');
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on the secure contact interactive', () => {
            config.set(
                'page.pageId',
                'help/ng-interactive/2017/mar/17/contact-the-guardian-securely'
            );

            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on secure contact help page', () => {
            config.set(
                'page.pageId',
                'help/2016/sep/19/how-to-contact-the-guardian-securely'
            );

            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });
    });

    describe('Third party tags under ad-free', () => {
        beforeEach(() => {
            isAdFreeUser.mockReturnValue(true);
        });

        it('Does not run by default', () => {
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on identity pages', () => {
            config.set('page.contentType', 'Identity');
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on identity section', () => {
            // This is needed for identity pages in the profile subdomain
            config.set('page.section', 'identity');
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on secure contact pages', () => {
            config.set(
                'page.pageId',
                'help/ng-interactive/2017/mar/17/contact-the-guardian-securely'
            );

            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });
    });

    describe('Plista', () => {
        // These are the 'promoted links from around the web' widgets
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.plista).toBe(true);
        });

        it('Is disabled under perf tests', () => {
            window.location.hash = '#noads';
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled in sensitive content', () => {
            config.set('page.shouldHideAdverts', true);
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled when related content is hidden', () => {
            config.set('page.showRelatedContent', false);
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled when user is logged in and page is commentable', () => {
            isUserLoggedIn.mockReturnValue(true);
            config.set('page.commentable', true);
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });
    });

    describe('Plista under ad-free', () => {
        beforeEach(() => {
            isAdFreeUser.mockReturnValue(true);
        });

        // happy time!
        it('Does not run by default', () => {
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled under perf tests', () => {
            window.location.hash = '#noads';
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled in sensitive content', () => {
            config.set('page.shouldHideAdverts', true);
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled when related content is hidden', () => {
            config.set('page.showRelatedContent', false);
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });

        it('Is disabled when user is logged in and page is commentable', () => {
            config.set('page.commentable', true);
            const features = new CommercialFeatures();
            expect(features.plista).toBe(false);
        });
    });

    describe('Comment adverts', () => {
        beforeEach(() => {
            config.set('page.commentable', true);
            isUserLoggedIn.mockReturnValue(true);
        });

        it('Displays when page has comments', () => {
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(true);
        });

        it('Will also display when the user is not logged in', () => {
            isUserLoggedIn.mockReturnValue(false);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(true);
        });

        it('Does not display on minute articles', () => {
            config.set('page.isMinuteArticle', true);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Short circuits when no comments to add adverts to', () => {
            config.set('page.commentable', false);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        describe('If live blog', () => {
            beforeEach(() => {
                config.set('page.isLiveBlog', true);
            });

            it('Appears if page is wide', () => {
                getBreakpoint.mockReturnValue('wide');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(true);
            });

            it('Does not appear if page is not wide', () => {
                getBreakpoint.mockReturnValue('desktop');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(false);
            });
        });
    });

    describe('Comment adverts under ad-free', () => {
        beforeEach(() => {
            config.set('page.commentable', true);
            isAdFreeUser.mockReturnValue(true);
        });

        it('Does not display when page has comments', () => {
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Does not display on minute articles', () => {
            config.set('page.isMinuteArticle', true);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Does not appear when user signed out', () => {
            isUserLoggedIn.mockReturnValue(false);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Short circuits when no comments to add adverts to', () => {
            config.set('page.commentable', false);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        describe('If live blog', () => {
            beforeEach(() => {
                config.set('page.isLiveBlog', true);
            });

            it('Does not appear if page is wide', () => {
                getBreakpoint.mockReturnValue('wide');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(false);
            });

            it('Does not appear if page is not wide', () => {
                getBreakpoint.mockReturnValue('desktop');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(false);
            });
        });
    });

    describe('comscore ', () => {
        beforeEach(() => {
            config.set('switches.comscore', true);
        });

        it('Runs if switch is on', () => {
            const features = new CommercialFeatures();
            expect(features.comscore).toBe(true);
        });

        it('Does not run if switch is off', () => {
            config.set('switches.comscore', false);
            const features = new CommercialFeatures();
            expect(features.comscore).toBe(false);
        });

        it('Does not run on identity pages', () => {
            config.set('page.contentType', 'Identity');
            const features = new CommercialFeatures();
            expect(features.comscore).toBe(false);
        });

        it('Does not run on identity section', () => {
            // This is needed for identity pages in the profile subdomain
            config.set('page.section', 'identity');
            const features = new CommercialFeatures();
            expect(features.comscore).toBe(false);
        });

        it('Does not run on the secure contact interactive', () => {
            config.set(
                'page.pageId',
                'help/ng-interactive/2017/mar/17/contact-the-guardian-securely'
            );

            const features = new CommercialFeatures();
            expect(features.comscore).toBe(false);
        });

        it('Does not run on secure contact help page', () => {
            config.set(
                'page.pageId',
                'help/2016/sep/19/how-to-contact-the-guardian-securely'
            );

            const features = new CommercialFeatures();
            expect(features.comscore).toBe(false);
        });
    });
});

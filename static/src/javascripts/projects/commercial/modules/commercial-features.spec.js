// @flow
import { commercialFeatures } from 'commercial/modules/commercial-features';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import detect from 'lib/detect';
import identity from 'common/modules/identity/api';
import {
    isPayingMember as isPayingMember_,
    isRecentContributor as isRecentContributor_,
    shouldSeeReaderRevenue as shouldSeeReaderRevenue_,
    isAdFreeUser as isAdFreeUser_,
} from 'commercial/modules/user-features';
import { shouldShowReaderRevenue as shouldShowReaderRevenue_ } from 'common/modules/commercial/contributions-utilities';

const isPayingMember: JestMockFn = (isPayingMember_: any);
const isRecentContributor: JestMockFn = (isRecentContributor_: any);
const shouldSeeReaderRevenue: JestMockFn = (shouldSeeReaderRevenue_: any);
const isAdFreeUser: JestMockFn = (isAdFreeUser_: any);
const shouldShowReaderRevenue: JestMockFn = (shouldShowReaderRevenue_: any);

const CommercialFeatures = commercialFeatures.constructor;

jest.mock('lib/config', () => ({
    switches: {},
    page: {},
    hasTone: jest.fn(),
}));

jest.mock('commercial/modules/user-features', () => ({
    isPayingMember: jest.fn(),
    isRecentContributor: jest.fn(),
    shouldSeeReaderRevenue: jest.fn(),
    isAdFreeUser: jest.fn(),
}));

jest.mock('lib/detect', () => ({
    getBreakpoint: jest.fn(),
    adblockInUse: Promise.resolve(false),
}));

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));

jest.mock('common/modules/commercial/contributions-utilities', () => ({
    shouldShowReaderRevenue: jest.fn(),
}));

describe('Commercial features', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        // Set up a happy path by default
        config.page = {
            contentType: 'Article',
            isMinuteArticle: false,
            section: 'politics',
            shouldHideAdverts: false,
            shouldHideReaderRevenue: false,
            isFront: false,
            showRelatedContent: true,
        };

        config.switches = {
            outbrain: true,
            commercial: true,
            commentsVisibleOnArticle: true,
            adFreeSubscriptionTrial: false,
        };

        window.location.hash = '';

        userPrefs.removeSwitch('adverts');

        detect.getBreakpoint.mockReturnValue('desktop');

        detect.adblockInUse = Promise.resolve(false);

        isPayingMember.mockReturnValue(false);
        isRecentContributor.mockReturnValue(false);
        shouldSeeReaderRevenue.mockReturnValue(true);
        isAdFreeUser.mockReturnValue(false);

        identity.isUserLoggedIn.mockReturnValue(true);
    });

    describe('DFP advertising', () => {
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(true);
        });

        it('Is disabled on sensitive pages', () => {
            // Like all newspapers, the Guardian must sometimes cover disturbing and graphic content.
            // Showing adverts on these pages would be crass - callous, even.
            config.page.shouldHideAdverts = true;
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(false);
        });

        it('Is disabled on the children`s book site', () => {
            // ASA guidelines prohibit us from showing adverts on anything that might be deemed childrens' content
            config.page.section = 'childrens-books-site';
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(false);
        });

        it('Is skipped for speedcurve tests', () => {
            // We don't want external dependencies getting in the way of perf tests
            window.location.hash = '#noads';
            const features = new CommercialFeatures();
            expect(features.dfpAdvertising).toBe(false);
        });
    });

    describe('Article body adverts', () => {
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(true);
        });

        it('Doesn`t run in minute articles', () => {
            config.page.isMinuteArticle = true;
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });

        it('Doesn`t run in non-article pages', () => {
            config.page.contentType = 'Network Front';
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });

        it('Doesn`t run in live blogs', () => {
            config.page.isLiveBlog = true;
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });
    });

    describe('Article body adverts under ad-free', () => {
        // LOL grammar
        it('are disabled', () => {
            config.switches.adFreeSubscriptionTrial = true;
            isAdFreeUser.mockReturnValue(true);
            const features = new CommercialFeatures();
            expect(features.articleBodyAdverts).toBe(false);
        });
    });

    describe('Article aside adverts', () => {
        it('Runs by default in articles', () => {
            config.page.contentType = 'Article';
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(true);
        });

        it('Runs by default in liveblogs', () => {
            config.page.contentType = 'LiveBlog';
            config.page.isLiveBlog = true;
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(true);
        });

        it('Doesn`t run in minute articles', () => {
            config.page.isMinuteArticle = true;
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(false);
        });

        it('Doesn`t run in non-article non-liveblog pages', () => {
            config.page.contentType = 'Network Front';
            config.page.isLiveBlog = false;
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(false);
        });
    });

    describe('Article aside adverts under ad-free', () => {
        beforeEach(() => {
            config.switches.adFreeSubscriptionTrial = true;
            isAdFreeUser.mockReturnValue(true);
        });

        it('are disabled in articles', () => {
            config.page.contentType = 'Article';
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(false);
        });

        it('are disabled in liveblogs', () => {
            config.page.contentType = 'LiveBlog';
            config.page.isLiveBlog = true;
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(false);
        });

        it('are disabled in minute articles', () => {
            config.page.isMinuteArticle = true;
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(false);
        });

        it('are disabled in non-article non-liveblog pages (e.g. network front)', () => {
            config.page.contentType = 'Network Front';
            config.page.isLiveBlog = false;
            const features = new CommercialFeatures();
            expect(features.articleAsideAdverts).toBe(false);
        });
    });

    describe('Video prerolls', () => {
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.videoPreRolls).toBe(true);
        });
    });

    describe('Video prerolls under ad-free', () => {
        it('are disabled', () => {
            config.switches.adFreeSubscriptionTrial = true;
            isAdFreeUser.mockReturnValue(true);
            const features = new CommercialFeatures();
            expect(features.videoPreRolls).toBe(false);
        });
    });

    describe('High-relevance commercial component', () => {
        it('Does not run on fronts', () => {
            config.page.isFront = true;
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });

        it('Does run on outside of fronts', () => {
            config.page.isFront = false;
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(true);
        });

        it('Does not run on minute articles', () => {
            config.page.isMinuteArticle = true;
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });
    });

    describe('High-relevance commercial component under ad-free', () => {
        beforeEach(() => {
            config.switches.adFreeSubscriptionTrial = true;
            isAdFreeUser.mockReturnValue(true);
        });

        it('Does not run on fronts', () => {
            config.page.isFront = true;
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(false);
        });

        it('Does run outside of fronts', () => {
            config.page.isFront = false;
            const features = new CommercialFeatures();
            expect(features.highMerch).toBe(true);
        });

        it('Does not run on minute articles', () => {
            config.page.isMinuteArticle = true;
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
            config.page.contentType = 'Identity';
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on identity section', () => {
            // This is needed for identity pages in the profile subdomain
            config.page.section = 'identity';
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });
    });

    describe('Third party tags under ad-free', () => {
        beforeEach(() => {
            config.switches.adFreeSubscriptionTrial = true;
            isAdFreeUser.mockReturnValue(true);
        });

        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(true);
        });

        it('Does not run on identity pages', () => {
            config.page.contentType = 'Identity';
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });

        it('Does not run on identity section', () => {
            // This is needed for identity pages in the profile subdomain
            config.page.section = 'identity';
            const features = new CommercialFeatures();
            expect(features.thirdPartyTags).toBe(false);
        });
    });

    describe('Outbrain / Plista', () => {
        // These are the 'promoted links from around the web' widgets
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(true);
        });

        it('Is disabled under perf tests', () => {
            window.location.hash = '#noads';
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });

        it('Is disabled in sensitive content', () => {
            config.page.shouldHideAdverts = true;
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });

        it('Is disabled when related content is hidden', () => {
            config.page.showRelatedContent = false;
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });

        it('Is disabled when user is logged in and page is commentable', () => {
            identity.isUserLoggedIn.mockReturnValue(true);
            config.page.commentable = true;
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });
    });

    describe('Outbrain / Plista under ad-free', () => {
        beforeEach(() => {
            config.switches.adFreeSubscriptionTrial = true;
            isAdFreeUser.mockReturnValue(true);
        });

        // sad but true
        it('Runs by default', () => {
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(true);
        });

        it('Is disabled under perf tests', () => {
            window.location.hash = '#noads';
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });

        it('Is disabled in sensitive content', () => {
            config.page.shouldHideAdverts = true;
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });

        it('Is disabled when related content is hidden', () => {
            config.page.showRelatedContent = false;
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });

        it('Is disabled when user is logged in and page is commentable', () => {
            config.page.commentable = true;
            const features = new CommercialFeatures();
            expect(features.outbrain).toBe(false);
        });
    });

    describe('Comment adverts', () => {
        beforeEach(() => {
            config.page.commentable = true;
            // isAdFreeUser.mockReturnValue(true);
            identity.isUserLoggedIn.mockReturnValue(true);
        });

        it('Displays when page has comments and user is signed in', () => {
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(true);
        });

        it('Does not display on minute articles', () => {
            config.page.isMinuteArticle = true;
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Does not appear when user signed out', () => {
            identity.isUserLoggedIn.mockReturnValue(false);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Short circuits when no comments to add adverts to', () => {
            config.page.commentable = false;
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        describe('If live blog', () => {
            beforeEach(() => {
                config.page.isLiveBlog = true;
            });

            it('Appears if page is wide', () => {
                detect.getBreakpoint.mockReturnValue('wide');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(true);
            });

            it('Does not appear if page is not wide', () => {
                detect.getBreakpoint.mockReturnValue('desktop');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(false);
            });
        });
    });

    describe('Comment adverts under ad-free', () => {
        beforeEach(() => {
            config.switches.adFreeSubscriptionTrial = true;
            config.page.commentable = true;
            isAdFreeUser.mockReturnValue(true);
        });

        it('Does not display when page has comments', () => {
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Does not display on minute articles', () => {
            config.page.isMinuteArticle = true;
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Does not appear when user signed out', () => {
            identity.isUserLoggedIn.mockReturnValue(false);
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        it('Short circuits when no comments to add adverts to', () => {
            config.page.commentable = false;
            const features = new CommercialFeatures();
            expect(features.commentAdverts).toBe(false);
        });

        describe('If live blog', () => {
            beforeEach(() => {
                config.page.isLiveBlog = true;
            });

            it('Does not appear if page is wide', () => {
                detect.getBreakpoint.mockReturnValue('wide');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(false);
            });

            it('Does not appear if page is not wide', () => {
                detect.getBreakpoint.mockReturnValue('desktop');
                const features = new CommercialFeatures();
                expect(features.commentAdverts).toBe(false);
            });
        });
    });

    describe('Membership messages', () => {
        it('Displays messages by default', () => {
            shouldShowReaderRevenue.mockReturnValue(true);
            const features = new CommercialFeatures();
            return features.asynchronous.canDisplayMembershipEngagementBanner.then(
                flag => {
                    expect(flag).toBe(true);
                }
            );
        });

        it('Does not display messages when adBlock is enabled', () => {
            // i.e. we want to show the adblock message instead
            detect.adblockInUse = Promise.resolve(true);
            const features = new CommercialFeatures();
            return features.asynchronous.canDisplayMembershipEngagementBanner.then(
                flag => {
                    expect(flag).toBe(false);
                }
            );
        });
    });
});

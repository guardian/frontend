define(['helpers/injector'], function (Injector) {
    var injector = new Injector();

    describe('Commercial features', function () {
        var CommercialFeatures, config, features,
            userPrefs, detect, userFeatures, isSignedIn, breakpoint;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/commercial-features',
                'lib/config',
                'common/modules/user-prefs',
                'lib/detect',
                'commercial/modules/user-features',
                'common/modules/identity/api'
            ], function () {
                CommercialFeatures = arguments[0].commercialFeatures.constructor;
                config = arguments[1];
                userPrefs = arguments[2];
                detect = arguments[3];
                userFeatures = arguments[4];
                var identityApi = arguments[5];

                // Set up a happy path by default
                config.page = {
                    contentType : 'Article',
                    isMinuteArticle : false,
                    section : 'politics',
                    shouldHideAdverts : false,
                    isFront : false,
                    showRelatedContent: true
                };

                config.switches = {
                    outbrain : true,
                    commercial : true,
                    discussion : true,
                    adFreeMembershipTrial: false
                };

                window.location.hash = '';

                userPrefs.removeSwitch('adverts');

                breakpoint = 'desktop';
                detect.getBreakpoint = function () { return breakpoint; };

                detect.adblockInUse = Promise.resolve(false);

                userFeatures.isPayingMember = function () {return false;};

                userFeatures.isAdFreeUser = function() {return isSignedIn && config.switches.adFreeMembershipTrial;};

                identityApi.isUserLoggedIn = function () {
                    return isSignedIn;
                };

                done();
            });
        });

        describe('DFP advertising', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.dfpAdvertising).toBe(true);
            });

            it('Is disabled on sensitive pages', function () {
                // Like all newspapers, the Guardian must sometimes cover disturbing and graphic content.
                // Showing adverts on these pages would be crass - callous, even.
                config.page.shouldHideAdverts = true;
                features = new CommercialFeatures;
                expect(features.dfpAdvertising).toBe(false);
            });

            it('Is disabled on the children`s book site', function () {
                // ASA guidelines prohibit us from showing adverts on anything that might be deemed childrens' content
                config.page.section = 'childrens-books-site';
                features = new CommercialFeatures;
                expect(features.dfpAdvertising).toBe(false);
            });

            it('Is skipped for speedcurve tests', function () {
                // We don't want external dependencies getting in the way of perf tests
                window.location.hash = '#noads';
                features = new CommercialFeatures;
                expect(features.dfpAdvertising).toBe(false);
            });
        });

        describe('Article body adverts', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.articleBodyAdverts).toBe(true);
            });

            it('Doesn`t run in minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.articleBodyAdverts).toBe(false);
            });

            it('Doesn`t run in non-article pages', function () {
                config.page.contentType = 'Network Front';
                features = new CommercialFeatures;
                expect(features.articleBodyAdverts).toBe(false);
            });

            it('Doesn`t run in live blogs', function () {
                config.page.isLiveBlog = true;
                features = new CommercialFeatures;
                expect(features.articleBodyAdverts).toBe(false);
            });
        });

        describe('Article body adverts under ad-free', function() {
            // LOL grammar
            it('are disabled', function() {
                config.switches.adFreeMembershipTrial = true;
                isSignedIn = true;
                features = new CommercialFeatures;
                expect(features.articleBodyAdverts).toBe(false);
            });
        });

        describe('Article aside adverts', function () {
            it('Runs by default in articles', function () {
                config.page.contentType = 'Article';
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(true);
            });

            it('Runs by default in liveblogs', function () {
                config.page.contentType = 'LiveBlog';
                config.page.isLiveBlog = true;
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(true);
            });

            it('Doesn`t run in minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(false);
            });

            it('Doesn`t run in non-article non-liveblog pages', function () {
                config.page.contentType = 'Network Front';
                config.page.isLiveBlog = false;
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(false);
            });
        });

        describe('Article aside adverts under ad-free', function () {
            beforeEach(function () {
                config.switches.adFreeMembershipTrial = true;
                isSignedIn = true;
            });

            it('are disabled in articles', function () {
                config.page.contentType = 'Article';
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(false);
            });

            it('are disabled in liveblogs', function () {
                config.page.contentType = 'LiveBlog';
                config.page.isLiveBlog = true;
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(false);
            });

            it('are disabled in minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(false);
            });

            it('are disabled in non-article non-liveblog pages (e.g. network front)', function () {
                config.page.contentType = 'Network Front';
                config.page.isLiveBlog = false;
                features = new CommercialFeatures;
                expect(features.articleAsideAdverts).toBe(false);
            });
        });

        describe('Video prerolls', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.videoPreRolls).toBe(true);
            });
        });

        describe('Video prerolls under ad-free', function () {
            it('are disabled', function () {
                config.switches.adFreeMembershipTrial = true;
                isSignedIn = true;
                features = new CommercialFeatures;
                expect(features.videoPreRolls).toBe(false);
            });
        });

        describe('High-relevance commercial component', function () {
            it('Does not run on fronts', function () {
                config.page.isFront = true;
                features = new CommercialFeatures;
                expect(features.highMerch).toBe(false);
            });

            it('Does run on outside of fronts', function () {
                config.page.isFront = false;
                features = new CommercialFeatures;
                expect(features.highMerch).toBe(true);
            });

            it('Does not run on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.highMerch).toBe(false);
            });
        });

        describe('High-relevance commercial component under ad-free', function () {
            beforeEach(function () {
                config.switches.adFreeMembershipTrial = true;
                isSignedIn = true;
            });

            it('Does not run on fronts', function () {
                config.page.isFront = true;
                features = new CommercialFeatures;
                expect(features.highMerch).toBe(false);
            });

            it('Does run outside of fronts', function () {
                config.page.isFront = false;
                features = new CommercialFeatures;
                expect(features.highMerch).toBe(true);
            });

            it('Does not run on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.highMerch).toBe(false);
            });
        });

        describe('Third party tags', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.thirdPartyTags).toBe(true);
            });

            it('Does not run on identity pages', function () {
                config.page.contentType = 'Identity';
                features = new CommercialFeatures;
                expect(features.thirdPartyTags).toBe(false);
            });

            it('Does not run on identity section', function () {
                // This is needed for identity pages in the profile subdomain
                config.page.section = 'identity';
                features = new CommercialFeatures;
                expect(features.thirdPartyTags).toBe(false);
            });
        });

        describe('Third party tags under ad-free', function () {
            beforeEach(function () {
                config.switches.adFreeMembershipTrial = true;
                isSignedIn = true;
            });

            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.thirdPartyTags).toBe(true);
            });

            it('Does not run on identity pages', function () {
                config.page.contentType = 'Identity';
                features = new CommercialFeatures;
                expect(features.thirdPartyTags).toBe(false);
            });

            it('Does not run on identity section', function () {
                // This is needed for identity pages in the profile subdomain
                config.page.section = 'identity';
                features = new CommercialFeatures;
                expect(features.thirdPartyTags).toBe(false);
            });
        });

        describe('Outbrain / Plista', function () {
            // These are the 'promoted links from around the web' widgets
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(true);
            });

            it('Is disabled under perf tests', function () {
                window.location.hash = '#noads';
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled in sensitive content', function () {
                config.page.shouldHideAdverts = true;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled when related content is hidden', function () {
                config.page.showRelatedContent = false;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled when user is logged in and page is commentable', function () {
                isSignedIn = true;
                config.page.commentable = true;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });
        });

        describe('Outbrain / Plista under ad-free', function () {
            beforeEach(function () {
                config.switches.adFreeMembershipTrial = true;
                isSignedIn = true;
            });

            // sad but true
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(true);
            });

            it('Is disabled under perf tests', function () {
                window.location.hash = '#noads';
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled in sensitive content', function () {
                config.page.shouldHideAdverts = true;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled when related content is hidden', function () {
                config.page.showRelatedContent = false;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled when user is logged in and page is commentable', function () {
                config.page.commentable = true;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });
        });

        describe('Comment adverts', function () {
            beforeEach(function () {
                config.page.commentable = true;
                isSignedIn = true;
            });

            it('Displays when page has comments and user is signed in', function () {
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(true);
            });

            it('Does not display on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            it('Does not appear when user signed out', function () {
                isSignedIn = false;
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            it('Short circuits when no comments to add adverts to', function () {
                config.page.commentable = false;
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            describe('If live blog', function () {
                beforeEach(function () {
                    config.page.isLiveBlog = true;
                });

                it('Appears if page is wide', function () {
                    breakpoint = 'wide';
                    features = new CommercialFeatures;
                    expect(features.commentAdverts).toBe(true);
                });

                it('Does not appear if page is not wide', function () {
                    breakpoint = 'desktop';
                    features = new CommercialFeatures;
                    expect(features.commentAdverts).toBe(false);
                });
            });
        });

        describe('Comment adverts under ad-free', function () {
            beforeEach(function () {
                config.switches.adFreeMembershipTrial = true;
                config.page.commentable = true;
                isSignedIn = true;
            });

            it('Does not display when page has comments', function () {
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            it('Does not display on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            it('Does not appear when user signed out', function () {
                isSignedIn = false;
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            it('Short circuits when no comments to add adverts to', function () {
                config.page.commentable = false;
                features = new CommercialFeatures;
                expect(features.commentAdverts).toBe(false);
            });

            describe('If live blog', function () {
                beforeEach(function () {
                    config.page.isLiveBlog = true;
                });

                it('Does not appear if page is wide', function () {
                    breakpoint = 'wide';
                    features = new CommercialFeatures;
                    expect(features.commentAdverts).toBe(false);
                });

                it('Does not appear if page is not wide', function () {
                    breakpoint = 'desktop';
                    features = new CommercialFeatures;
                    expect(features.commentAdverts).toBe(false);
                });
            });
        });

        describe('Membership messages', function () {
            it('Displays messages by default', function (done) {
                features = new CommercialFeatures;
                features.asynchronous.canDisplayMembershipEngagementBanner.then(function (flag) {
                    expect(flag).toBe(true);
                    done();
                });
            });

            it('Does not display messages when adBlock is enabled', function (done) {
                // i.e. we want to show the adblock message instead
                detect.adblockInUse = Promise.resolve(true);
                features = new CommercialFeatures;
                features.asynchronous.canDisplayMembershipEngagementBanner.then(function (flag) {
                    expect(flag).toBe(false);
                    done();
                });
            });

            it('Does not ask paying members for money - because they are *already* giving us money, we do not want to hassle them', function () {
                userFeatures.isPayingMember = function () {return true;};
                features = new CommercialFeatures;
                expect(features.canReasonablyAskForMoney).toBe(false);
            });
        });
    });
});

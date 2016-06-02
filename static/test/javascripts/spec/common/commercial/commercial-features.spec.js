define(['helpers/injector', 'Promise'], function (Injector, Promise) {
    var injector = new Injector();

    describe('Commercial features', function () {
        var CommercialFeatures, config, features, location,
            userPrefs, detect, userFeatures, isSignedIn, breakpoint;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/commercial-features',
                'common/utils/config',
                'common/utils/location',
                'common/modules/user-prefs',
                'common/utils/detect',
                'common/modules/commercial/user-features',
                'common/modules/identity/api'
            ], function () {
                CommercialFeatures = arguments[0].constructor;
                config = arguments[1];
                location = arguments[2];
                userPrefs = arguments[3];
                detect = arguments[4];
                userFeatures = arguments[5];
                var identityApi = arguments[6];

                // Set up a happy path by default
                config.page = {
                    contentType : 'Article',
                    isMinuteArticle : false,
                    isSSL : false,
                    section : 'politics',
                    shouldHideAdverts : false,
                    isFront : false,
                    showRelatedContent: true
                };

                config.switches = {
                    commercialComponents : true,
                    outbrain : true,
                    sponsored : true,
                    standardAdverts : true,
                    videoAdverts : true,
                    discussion : true
                };

                location.getHash = function () {return '';};

                userPrefs.removeSwitch('adverts');

                breakpoint = 'desktop';
                detect.getBreakpoint = function () { return breakpoint; };

                detect.adblockInUse = Promise.resolve(false);

                userFeatures.isPayingMember = function () {return false;};

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

            it('Is disabled under SSL', function () {
                config.page.isSSL = true;
                features = new CommercialFeatures;
                expect(features.dfpAdvertising).toBe(false);
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
                location.getHash = function () {return '#noads';};
                features = new CommercialFeatures;
                expect(features.dfpAdvertising).toBe(false);
            });
        });

        describe('Top banner ad', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.topBannerAd).toBe(true);
            });

            it('Doesn`t run in minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.topBannerAd).toBe(false);
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

        describe('Article aside adverts', function () {
            it('Runs by default in artcles', function () {
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

        describe('Slice adverts', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.sliceAdverts).toBe(true);
            });

            it('Does not run on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.sliceAdverts).toBe(false);
            });
        });

        describe('Popular content MPUs', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.popularContentMPU).toBe(true);
            });

            it('Does not run on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.popularContentMPU).toBe(false);
            });
        });

        describe('Video prerolls', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.videoPreRolls).toBe(true);
            });
        });

        describe('Commercial components on fronts', function () {
            it('Runs by default on fronts', function () {
                config.page.isFront = true;
                features = new CommercialFeatures;
                expect(features.frontCommercialComponents).toBe(true);
            });

            it('Does not run outside fronts', function () {
                config.page.isFront = false;
                features = new CommercialFeatures;
                expect(features.frontCommercialComponents).toBe(false);
            });

            it('Does not run on minute articles', function () {
                config.page.isMinuteArticle = true;
                features = new CommercialFeatures;
                expect(features.frontCommercialComponents).toBe(false);
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

        describe('Sponsored / paid content badges', function () {
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.badges).toBe(true);
            });
        });

        describe('Outbrain / Plista', function () {
            // These are the 'promoted links from around the web' widgets
            it('Runs by default', function () {
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(true);
            });

            it('Is disabled under SSL', function () {
                config.page.isSSL = true;
                features = new CommercialFeatures;
                expect(features.outbrain).toBe(false);
            });

            it('Is disabled under perf tests', function () {
                location.getHash = function () {return '#noads';};
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

        describe('Membership messages', function () {
            it('Displays messages by default', function (done) {
                features = new CommercialFeatures;
                features.async.membershipMessages.then(function (flag) {
                    expect(flag).toBe(true);
                    done();
                });
            });

            it('Does not display messages when adBlock is enabled', function (done) {
                // i.e. we want to show the adblock message instead
                detect.adblockInUse = Promise.resolve(true);
                features = new CommercialFeatures;
                features.async.membershipMessages.then(function (flag) {
                    expect(flag).toBe(false);
                    done();
                });
            });

            it('Does not display messages on mobile', function (done) {
                detect.getBreakpoint = function () { return 'mobile'; };
                features = new CommercialFeatures;
                features.async.membershipMessages.then(function (flag) {
                    expect(flag).toBe(false);
                    done();
                });
            });

            it('Does not display messages outside articles', function (done) {
                config.page.contentType = 'Network Front';
                features = new CommercialFeatures;
                features.async.membershipMessages.then(function (flag) {
                    expect(flag).toBe(false);
                    done();
                });
            });

            it('Does not display messages to existing members', function (done) {
                userFeatures.isPayingMember = function () {return true;};
                features = new CommercialFeatures;
                features.async.membershipMessages.then(function (flag) {
                    expect(flag).toBe(false);
                    done();
                });
            });
        });
    });
});

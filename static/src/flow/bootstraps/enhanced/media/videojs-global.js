define(['videojs'], function (videojs) {
    // FIXME: This is a bit of a nasty hack to be able to include this file in certain
    // videosjs plugins without forking the repos, adding UDM and becoming out of date
    window.videojs = videojs;
});

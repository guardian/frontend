define([
    'fastdom',
    'common/modules/atoms/youtube-player',
    'common/modules/atoms/youtube-tracking',
    'common/modules/component',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/closest',
    'lodash/functions/debounce'
], function (
    fastdom,
    youtubePlayer,
    tracking,
    Component,
    $,
    config,
    detect,
    closest,
    debounce
) {

    var players = {};

    var STATES = {
        'ENDED': onPlayerEnded,
        'PLAYING': onPlayerPlaying,
        'PAUSED': onPlayerPaused
    };

    function checkState(atomId, state, status) {
        if (state === window.YT.PlayerState[status] && STATES[status]) {
            STATES[status](atomId);
        }
    }

    function onPlayerPlaying(atomId) {
        var player = players[atomId];

        killProgressTracker(atomId);
        setProgressTracker(atomId);
        tracking.track('play', getTrackingId(atomId));

        var mainMedia = closest(player.iframe, '.immersive-main-media');
        if (mainMedia) {
            mainMedia.classList.add('atom-playing');
        }

        if (player.endSlate &&
            !player.overlay.parentNode.querySelector('.end-slate-container')) {
            player.endSlate.fetch(player.overlay.parentNode, 'html');
        }
    }

    function onPlayerPaused(atomId) {
        killProgressTracker(atomId);
    }

    function onPlayerEnded(atomId) {
        var player = players[atomId];

        killProgressTracker(atomId);
        tracking.track('end', getTrackingId(atomId));
        player.pendingTrackingCalls = [25, 50, 75];

        var mainMedia = closest(player.iframe, '.immersive-main-media');
        if (mainMedia) {
            mainMedia.classList.remove('atom-playing');
        }

    }

    function setProgressTracker(atomId)  {
        players[atomId].progressTracker = setInterval(recordPlayerProgress.bind(null, atomId), 1000);
    }

    function killProgressTracker(atomId) {
        if (players[atomId].progressTracker) {
            clearInterval(players[atomId].progressTracker);
        }
    }

    function recordPlayerProgress(atomId) {
        var player = players[atomId].player;
        var pendingTrackingCalls = players[atomId].pendingTrackingCalls;

        if (!pendingTrackingCalls.length) {
            return;
        }

        if (!player.duration) {
            player.duration = player.getDuration();
        }

        var currentTime = player.getCurrentTime();
        var percentPlayed = Math.round(((currentTime / player.duration) * 100));

        if (percentPlayed >= pendingTrackingCalls[0]) {
            tracking.track(pendingTrackingCalls[0], getTrackingId(atomId));
            pendingTrackingCalls.shift();
        }
    }

    function shouldAutoplay(atomId){

        function isAutoplayBlockingPlatform() {
            return detect.isIOS() || detect.isAndroid();
        }

        function isInternalReferrer() {
            if (config.page.isDev) {
                return document.referrer.indexOf(window.location.origin) === 0;
            }
            else {
                return document.referrer.indexOf(config.page.host) === 0;
            }
        }

        function isMainVideo() {
            return closest(players[atomId].iframe, 'figure[data-component="main video"]');
        }

        return config.page.contentType === 'Video' &&
            isInternalReferrer() &&
            !isAutoplayBlockingPlatform() &&
            isMainVideo();
    }

    function onPlayerReady(atomId, overlay, iframe, event) {
        players[atomId] = {
            player: event.target,
            pendingTrackingCalls: [25, 50, 75],
            iframe: iframe
        };

        if(shouldAutoplay(atomId)) {
            event.target.playVideo();
        }

        if (overlay) {
            showDuration(atomId, overlay);

            players[atomId].overlay = overlay;

            if (!!config.page.section && detect.isBreakpoint({ min: 'desktop' })) {
                players[atomId].endSlate = getEndSlate(overlay);
            }
        }

        if (closest(iframe, '.immersive-main-media__media')) {
            updateImmersiveButtonPos();
            window.addEventListener('resize', debounce(updateImmersiveButtonPos.bind(null), 200));
        }
    }

    function getFormattedDuration(durationInSeconds) {
        var times = [];
        var hours = Math.floor(durationInSeconds / 3600);
        var minutes = Math.floor((durationInSeconds - hours * 3600) / 60);
        var seconds = (durationInSeconds - hours * 3600) - (minutes * 60);

        if (hours) {
            times.push(hours);
            times.push(formatTime(minutes));
        } else {
            times.push(minutes);
        }
        times.push(formatTime(seconds));

        return times.join(':');
    }

    function formatTime(time) {
        return ('0' + time).slice(-2);
    }

    function showDuration(atomId, overlay) {
        var durationElem = overlay.querySelector('.youtube-media-atom__bottom-bar__duration');

        if (durationElem) {
            durationElem.innerText = getFormattedDuration(players[atomId].player.getDuration());
        }
    }

    function getEndSlate(overlay) {
        var endSlatePath = overlay.parentNode.dataset.endSlate;
        var endSlate = new Component();

        endSlate.endpoint = endSlatePath;

        return endSlate;
    }

    function onPlayerStateChange(atomId, event) {
        Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));
    }

    function checkElemsForVideos(elems) {
        if (elems && elems.length) {
            elems.forEach(checkElemForVideo);
        } else {
            checkElemForVideo(document.body);
        }
    }

    function checkElemForVideo(elem) {
        fastdom.read(function () {
            $('.youtube-media-atom', elem).each(function (el, index) {
                var iframe = el.querySelector('iframe');

                if (!iframe) {
                    return;
                }

                // append index of atom as iframe.id must be unique
                iframe.id += '/' + index;

                // append index of atom as atomId must be unique
                var atomId = el.getAttribute('data-media-atom-id') + '/' + index;
                var overlay = el.querySelector('.youtube-media-atom__overlay');

                tracking.init(getTrackingId(atomId));

                youtubePlayer.init(iframe, {
                    onPlayerReady: onPlayerReady.bind(null, atomId, overlay, iframe),
                    onPlayerStateChange: onPlayerStateChange.bind(null, atomId)
                }, iframe.id);
            });
        });
    }

    function updateImmersiveButtonPos() {
        var playerHeight = document.querySelector('.immersive-main-media__media .youtube-media-atom').offsetHeight;
        var headline = document.querySelector('.immersive-main-media__headline-container');
        var headlineHeight = headline ? headline.offsetHeight : 0;
        var buttonOffset = playerHeight - headlineHeight;
        var immersiveInterface = document.querySelector('.youtube-media-atom__immersive-interface');
        immersiveInterface.style.top = buttonOffset + 'px';
    }

    // retrieves actual id of atom without appended index
    function getTrackingId(atomId) {
        return atomId.split('/')[0];
    }

    return {
        checkElemsForVideos: checkElemsForVideos
    };
});

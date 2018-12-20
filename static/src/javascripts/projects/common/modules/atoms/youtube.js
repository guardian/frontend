// @flow
import fastdom from "lib/fastdom-promise";
import bonzo from "bonzo";
import { initYoutubePlayer } from "common/modules/atoms/youtube-player";
import {
    trackYoutubeEvent,
    initYoutubeEvents
} from "common/modules/atoms/youtube-tracking";
import { Component } from "common/modules/component";
import $ from "lib/$";
import config from "lib/config";
import { isIOS, isAndroid, isBreakpoint } from "lib/detect";
import debounce from "lodash/debounce";
import { isOn as accessibilityIsOn } from "common/modules/accessibility/main";

declare class YoutubePlayerTarget extends EventTarget {
    playVideo: () => void;
}

// This is imcomplete; see https://developers.google.com/youtube/iframe_api_reference#Events
declare class YoutubePlayerEvent {
    data: -1 | 0 | 1 | 2 | 3 | 4 | 5;
    target: YoutubePlayerTarget;
}

const players = {};
const playerDivs = [];

document.addEventListener("focusout", () => {
    playerDivs.forEach(playerDiv => {
        fastdom
            .read(() => {
                if (document.activeElement === playerDiv) {
                    return $(".vjs-big-play-button", playerDiv.parentElement);
                }
            })
            .then(($playButton: ?bonzo) => {
                fastdom.write(() => {
                    if ($playButton) {
                        $playButton.addClass("youtube-play-btn-focussed");
                    }
                });
            });
    });
});

document.addEventListener("focusin", () => {
    fastdom
        .read(() => $(".vjs-big-play-button"))
        .then(($playButton: ?bonzo) => {
            fastdom.write(() => {
                if ($playButton) {
                    $playButton.removeClass("youtube-play-btn-focussed");
                }
            });
        });
});

// retrieves actual id of atom without appended index
const getTrackingId = (atomId: string): string => atomId.split("/")[0];

const recordPlayerProgress = (atomId: string): void => {
    const player = players[atomId].player;
    const pendingTrackingCalls = players[atomId].pendingTrackingCalls;

    if (!pendingTrackingCalls.length) {
        return;
    }

    if (!player.duration) {
        player.duration = player.getDuration();
    }

    const currentTime = player.getCurrentTime();
    const percentPlayed = Math.round((currentTime / player.duration) * 100);

    if (percentPlayed >= pendingTrackingCalls[0]) {
        trackYoutubeEvent(pendingTrackingCalls[0], getTrackingId(atomId));
        pendingTrackingCalls.shift();
    }
};

const killProgressTracker = (atomId: string): void => {
    if (players[atomId].progressTracker) {
        clearInterval(players[atomId].progressTracker);
    }
};

const setProgressTracker = (atomId: string): IntervalID => {
    players[atomId].progressTracker = setInterval(
        recordPlayerProgress.bind(null, atomId),
        1000
    );
    return players[atomId].progressTracker;
};

const onPlayerPlaying = (atomId: string): void => {
    const player = players[atomId];
    const currentVideo = player.player.getVideoUrl().split("?v=")[1];
    const originalVideo = player.iframe.dataset.assetId;

    if (!player) {
        return;
    }

    killProgressTracker(atomId);

    // TODO: implement progress tracking for related videos
    if (currentVideo === originalVideo) {
        setProgressTracker(atomId);
        trackYoutubeEvent("play", getTrackingId(atomId));
    }

    const mainMedia =
        (player.iframe && player.iframe.closest(".immersive-main-media")) ||
        null;
    const parentNode = player.overlay && player.overlay.parentNode;
    const endSlateContainer =
        parentNode && parentNode.querySelector(".end-slate-container");

    if (mainMedia) {
        mainMedia.classList.add("atom-playing");
    }

    if (player.endSlate && !endSlateContainer) {
        player.endSlate.fetch(parentNode, "html");
    }
};

const onPlayerPaused = (atomId: string): void => killProgressTracker(atomId);

const onPlayerEnded = (atomId: string): void => {
    const player = players[atomId];

    killProgressTracker(atomId);
    trackYoutubeEvent("end", getTrackingId(atomId));
    player.pendingTrackingCalls = [25, 50, 75];

    const mainMedia =
        (player.iframe && player.iframe.closest(".immersive-main-media")) ||
        null;
    if (mainMedia) {
        mainMedia.classList.remove("atom-playing");
    }
};

const STATES = {
    ENDED: onPlayerEnded,
    PLAYING: onPlayerPlaying,
    PAUSED: onPlayerPaused
};

const checkState = (atomId: string, state: number, status: string): void => {
    if (state === window.YT.PlayerState[status] && STATES[status]) {
        STATES[status](atomId);
    }
};

const shouldAutoplay = (atomId: string): boolean => {
    const isAutoplayBlockingPlatform = () => isIOS() || isAndroid();

    const isInternalReferrer = () => {
        if (config.get("page.isDev")) {
            return document.referrer.indexOf(window.location.origin) === 0;
        }

        return document.referrer.indexOf(config.get("page.host")) === 0;
    };

    const isMainVideo = () =>
        (players[atomId].iframe &&
            players[atomId].iframe.closest(
                'figure[data-component="main video"]'
            )) ||
        false;

    const flashingElementsAllowed = () =>
        accessibilityIsOn("flashing-elements");

    const isVideoArticle = () =>
        config.get("page.contentType", "").toLowerCase() === "video";

    const isFront = () => config.get("page.isFront");

    return (
        ((isVideoArticle() && isInternalReferrer() && isMainVideo()) ||
            isFront()) &&
        !isAutoplayBlockingPlatform() &&
        flashingElementsAllowed()
    );
};

const getEndSlate = (overlay: HTMLElement): ?Component => {
    const overlayParent = overlay.parentNode;

    if (overlayParent instanceof HTMLElement) {
        const dataset = overlayParent.dataset || {};
        const endSlate = dataset.endSlate;

        if (endSlate) {
            const component = new Component();

            component.endpoint = endSlate;

            return component;
        }

        return undefined;
    }

    return undefined;
};

const updateImmersiveButtonPos = (): void => {
    const player = document.querySelector(
        ".immersive-main-media__media .youtube-media-atom"
    );
    const playerHeight = player ? player.offsetHeight : 0;
    const headline = document.querySelector(
        ".immersive-main-media__headline-container"
    );
    const headlineHeight = headline ? headline.offsetHeight : 0;
    const buttonOffset = playerHeight - headlineHeight;
    const immersiveInterface = document.querySelector(
        ".youtube-media-atom__immersive-interface"
    );

    if (immersiveInterface) {
        immersiveInterface.style.top = `${buttonOffset}px`;
    }
};

const onPlayerReady = (
    atomId: string,
    overlay: ?HTMLElement,
    iframe: ?HTMLElement,
    event: YoutubePlayerEvent
): void => {
    players[atomId] = {
        player: event.target,
        pendingTrackingCalls: [25, 50, 75],
        iframe
    };

    if (shouldAutoplay(atomId)) {
        event.target.playVideo();
    }

    if (overlay) {
        players[atomId].overlay = overlay;

        if (
            !!config.get("page.section") &&
            !config.get("switches.youtubeRelatedVideos") &&
            isBreakpoint({
                min: "desktop"
            })
        ) {
            players[atomId].endSlate = getEndSlate(overlay);
        }
    }

    if (iframe && iframe.closest(".immersive-main-media__media")) {
        updateImmersiveButtonPos();
        window.addEventListener(
            "resize",
            debounce(updateImmersiveButtonPos.bind(null), 200)
        );
    }
};

const onPlayerStateChange = (
    atomId: string,
    event: YoutubePlayerEvent
): void => {
    console.log("onPlayerStateChange --->", event);

    Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));
};

const initYoutubePlayerForElem = (el: ?HTMLElement, index: number): void => {
    fastdom.read(() => {
        if (!el) return;

        const playerDiv = el.querySelector("div");

        if (!playerDiv) {
            return;
        }

        playerDivs.push(playerDiv);

        // append index of atom as atomId must be unique
        const atomId = `${el.getAttribute("data-media-atom-id") ||
            ""}/${index}`;
        // need data attribute with index for unique lookup
        el.setAttribute("data-unique-atom-id", atomId);
        const overlay = el.querySelector(".youtube-media-atom__overlay");
        const channelId = el.getAttribute("data-channel-id") || "";

        initYoutubeEvents(getTrackingId(atomId));

        initYoutubePlayer(
            playerDiv,
            {
                onPlayerReady: onPlayerReady.bind(
                    null,
                    atomId,
                    overlay,
                    playerDiv
                ),
                onPlayerStateChange: onPlayerStateChange.bind(null, atomId)
            },
            playerDiv.dataset.assetId,
            channelId
        );
    });
};

const checkElemForVideo = (elem: ?HTMLElement): void => {
    if (!elem) return;

    fastdom.read(() => {
        $(".youtube-media-atom:not(.no-player)", elem).each((el, index) => {
            const overlay = el.querySelector(".youtube-media-atom__overlay");

            if (config.get("page.isFront")) {
                overlay.addEventListener("click", () => {
                    initYoutubePlayerForElem(el, index);
                });
            } else {
                initYoutubePlayerForElem(el, index);
            }
        });
    });
};

export const checkElemsForVideos = (elems: ?Array<HTMLElement>): void => {
    if (elems && elems.length) {
        elems.forEach(checkElemForVideo);
    } else {
        checkElemForVideo(document.body);
    }
};

export const onVideoContainerNavigation = (atomId: string): void => {
    const player = players[atomId];
    if (player) {
        player.player.pauseVideo();
    }
};

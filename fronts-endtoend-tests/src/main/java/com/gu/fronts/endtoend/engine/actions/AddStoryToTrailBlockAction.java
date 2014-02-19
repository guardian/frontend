package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import com.gu.fronts.endtoend.engine.TrailBlockMode;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpStatus;
import org.apache.http.cookie.Cookie;

public class AddStoryToTrailBlockAction implements TrailBlockAction {
	private final Story story;
	private final TrailBlock trailblock;
	private final TrailBlockMode mode;
	private Story positionOf;
	private HttpClientWrapper client;
	private HttpCall httpCall;

	public AddStoryToTrailBlockAction(Story story, TrailBlock trailblock) {
		this(story, trailblock, TrailBlockMode.LIVE);
	}

	public AddStoryToTrailBlockAction(Story storyA, TrailBlock trailBlock, Story storyB) {
		this(storyA, trailBlock, storyB, TrailBlockMode.LIVE);
	}

	public AddStoryToTrailBlockAction(Story story, TrailBlock trailBlock, TrailBlockMode mode) {
		this.story = story;
		this.trailblock = trailBlock;
		this.mode = mode;
	}

	public AddStoryToTrailBlockAction(
		Story storyA, TrailBlock trailBlock, Story storyB, TrailBlockMode mode
	) {
		story = storyA;
		this.trailblock = trailBlock;
		positionOf = storyB;
		this.mode = mode;
	}

	@Override
	public void useClient(HttpClientWrapper client) {
		this.client = client;
	}

	@Override
	public boolean success() {
		return HttpStatus.SC_OK == httpCall.response().getStatusLine().getStatusCode();
	}

	@Override
	public void setAuthenticationData(Cookie cookie) {
		client.addCookie(cookie);
	}

	@Override
	public void execute() {
		final String requestBody = requestBody();
        final String requestUrl = String.format("/edits");
        httpCall = client.postJsonTo(requestUrl, requestBody);
        return;
    }

	@Override
	public AddStoryToTrailBlockAction copyOf() {
		return new AddStoryToTrailBlockAction(story, trailblock);
	}

	private String requestBody() {
		if (positionOf == null) {
			return noPositionRequestBody();
		}
		return positionRequestBody();

	}

	private String positionRequestBody() {
        String data = "{\"update\":{" +
                "\"item\":\"%s\"" +
                ",\"draft\":%s" +
                ",\"live\":%s" +
                ",\"position\":\"%s\"" +
                ",\"id\":\"%s\"" +
                "}}";

        return String.format(data, story.getName(), isDraft(), isLive(), positionOf.getName(), trailblock.uri());
    }

	private String isLive() {
		return mode == TrailBlockMode.LIVE ? "true" : "false";
	}

    private String isDraft() {
        return mode == TrailBlockMode.DRAFT ? "true" : "false";
    }

    private String noPositionRequestBody() {
        String data = "{\"update\":{" +
                "\"item\":\"%s\"" +
                ",\"draft\":%s" +
                ",\"live\":%s" +
                ",\"id\":\"%s\"" +
                "}}";

        return String.format(data, story.getName(), isDraft(), isLive(), trailblock.uri());
    }
}

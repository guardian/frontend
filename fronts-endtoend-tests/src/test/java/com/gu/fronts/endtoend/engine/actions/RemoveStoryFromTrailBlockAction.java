package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.cookie.Cookie;

public class RemoveStoryFromTrailBlockAction implements TrailBlockAction {

	private final Story story;
	private final TrailBlock trailblock;
	private HttpClientWrapper client;
	private HttpCall httpCall;

	public RemoveStoryFromTrailBlockAction(Story story, TrailBlock trailblock) {
		this.story = story;
		this.trailblock = trailblock;
	}

	@Override
	public void useClient(HttpClientWrapper client) {
		this.client = client;
	}

	@Override
	public boolean success() {
		return HttpStatus.SC_OK == responseData().getStatusLine().getStatusCode();
	}

	@Override
	public <T> void setAuthenticationData(T data) {
		client.addCookie((Cookie) data);
	}

	@Override
	public void execute() {
		String data = "{" +
					  "\"item\":\"%s\"" +
					  ",\"draft\":true" +
					  ",\"live\":true" +
					  "}";

		final String requestUrl = String.format("/fronts/api/%s", trailblock.URI());
		httpCall = client.deleteFromWithJson(requestUrl, String.format(data, story.getName()));
	}

	@Override
	public AddStoryToTrailBlockAction copyOf() {
		return new AddStoryToTrailBlockAction(story, trailblock);
	}

	@Override
	public HttpRequest requestData() {
		return httpCall.request();
	}

	@Override
	public HttpResponse responseData() {
		return httpCall.response();
	}
}

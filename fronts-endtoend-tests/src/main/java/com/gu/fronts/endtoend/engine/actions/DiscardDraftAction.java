package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpStatus;
import org.apache.http.cookie.Cookie;

public class DiscardDraftAction implements TrailBlockAction {
	private final TrailBlock trailBlock;
	private HttpClientWrapper client;
	private HttpCall httpCall;

	public DiscardDraftAction(TrailBlock trailBlock) {
		this.trailBlock = trailBlock;
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
		String data = "{\"discard\":true}";

		final String requestUrl = String.format("/fronts/api/%s", trailBlock.uri());
		httpCall = client.postJsonTo(requestUrl, data);
	}

	@Override
	public DiscardDraftAction copyOf() {
		return new DiscardDraftAction(trailBlock);
	}

}

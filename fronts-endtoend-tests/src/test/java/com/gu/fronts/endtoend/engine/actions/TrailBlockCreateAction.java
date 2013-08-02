package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.cookie.Cookie;

public class TrailBlockCreateAction implements TrailBlockAction {
	private final TrailBlock trailBlock;
	private HttpClientWrapper client;
	private HttpCall httpCall;

	public TrailBlockCreateAction(TrailBlock trailBlock) {
		this.trailBlock = trailBlock;
	}

	@Override
	public <T> void setAuthenticationData(T data) {
		client.addCookie((Cookie) data);
	}

	@Override
	public void execute() {
		String data = "{" +
					  "\"item\":\"world/2013/aug/01/edward-snowden-leaves-moscow-airport-live\"" +
					  ",\"draft\":true" +
					  ",\"live\":true" +
					  "}";

		final String requestUrl = String.format("/fronts/api/%s", trailBlock.URI());
		httpCall = client.postJsonTo(requestUrl, data);
	}

	@Override
	public HttpRequest requestData() {
		return httpCall.request();
	}

	@Override
	public HttpResponse responseData() {
		return httpCall.response();
	}

	@Override
	public TrailBlockCreateAction copyOf() {
		return new TrailBlockCreateAction(trailBlock);
	}

	@Override
	public void useClient(HttpClientWrapper client) {
		this.client = client;
	}

	@Override
	public boolean success() {
		int statusCode = responseData().getStatusLine().getStatusCode();

		if (statusCode != HttpStatus.SC_CREATED && statusCode != HttpStatus.SC_OK) {
			return false;
		}

		return true;
	}
}

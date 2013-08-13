package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpStatus;
import org.apache.http.cookie.Cookie;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ViewTrailBlockAction implements TrailBlockAction {
	private final TrailBlock trailBlock;
	private HttpClientWrapper client;
	private HttpCall httpCall;
	private Exception lastException;

	public ViewTrailBlockAction(TrailBlock trailBlock) {
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
		final String requestUrl = String.format("/fronts/api/%s", trailBlock.uri());
		httpCall = client.getFrom(requestUrl);
	}

	@Override
	public ViewTrailBlockAction copyOf() {
		return new ViewTrailBlockAction(trailBlock);
	}

	public List<String> liveStories() {
		return getStories("live");
	}

	public List<String> draftStories() {
		return getStories("draft");
	}

	private String responseBody() {
		return httpCall.body();
	}

	private List<String> getStories(String mode) {
		List<String> foundStories = new ArrayList<>();
		try {
			JSONObject tb = new JSONObject(responseBody());
			JSONArray liveStories = tb.getJSONArray(mode);


			for (int i = 0; i < liveStories.length(); i++) {
				foundStories.add(liveStories.getJSONObject(i).getString("id"));
			}
		} catch (JSONException e) {
			lastException = e;
		}

		return foundStories;
	}
}

package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
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

	public ViewTrailBlockAction(TrailBlock trailBlock) {
		this.trailBlock = trailBlock;
	}

	@Override
	public void useClient(HttpClientWrapper client) {
		this.client = client;
	}

	@Override
	public boolean success() {
		return false;  //To change body of implemented methods use File | Settings | File Templates.
	}

	@Override
	public <T> void setAuthenticationData(T data) {
		client.addCookie((Cookie) data);
	}

	@Override
	public void execute() {
		final String requestUrl = String.format("/fronts/api/%s", trailBlock.URI());
		httpCall = client.getFrom(requestUrl);
	}

	@Override
	public ViewTrailBlockAction copyOf() {
		return new ViewTrailBlockAction(trailBlock);
	}

	@Override
	public HttpRequest requestData() {
		return httpCall.request();
	}

	@Override
	public HttpResponse responseData() {
		return httpCall.response();
	}

	public String responseBody() {
		return httpCall.body();
	}

	public List<String> liveStories() {
		return getStories("live");
	}

	public List<String> draftStories() {
		return getStories("draft");
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
			throw new RuntimeException(e);
		}

		return foundStories;
	}
}

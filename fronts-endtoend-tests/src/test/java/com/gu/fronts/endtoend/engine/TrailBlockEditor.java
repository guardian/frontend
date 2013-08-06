package com.gu.fronts.endtoend.engine;

import hu.meza.aao.RestfulActor;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.cookie.BasicClientCookie2;
import org.joda.time.DateTime;

import java.net.MalformedURLException;
import java.net.URL;

public class TrailBlockEditor extends RestfulActor {

	private final String baseUrl;
	private HttpClientWrapper client;

	public TrailBlockEditor(String baseUrl) {
		this.baseUrl = baseUrl;

		client = new HttpClientWrapper();
		client.dontCareAboutSSL();
		client.followRedirects();
		client.setHost(baseUrl);
	}

	@Override
	public Cookie authenticationData() {

		String cookieName = "PLAY_SESSION";
		String cookieValue =
			"22182f8e07fb2d6b5b4a37efef0f9a3dd1792fca-identity%3A%7B%22openid%22%3A%22https" +
			"%3A%2F%2Fwww.google" +
			".com%2Faccounts%2Fo8%2Fid%3Fid%3DAItOawmkiDiLXym8QB9d4hP9YLtkEHzYRcoqwuM%22%2C" +
			"%22email%22%3A%22marton.meszaros%40guardian.co" +
			".uk%22%2C%22firstName%22%3A%22Marton%22%2C%22lastName%22%3A%22Meszaros%22%7D";

		BasicClientCookie2 cookie = new BasicClientCookie2(cookieName, cookieValue);

		URL url;
		try {
			url = new URL(baseUrl);
		} catch (MalformedURLException e) {
			throw new RuntimeException(String.format("Could not decode url: %s", baseUrl));
		}

		cookie.setDomain(url.getHost());
		cookie.setPath("/");
		cookie.setSecure(false);
		DateTime expiry = new DateTime().plusYears(10);
		cookie.setExpiryDate(expiry.toDate());

		return cookie;
	}

	public void execute(TrailBlockAction action) {
		action.useClient(client);
		action.setAuthenticationData(authenticationData());
		super.execute(action);
	}
}

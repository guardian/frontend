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
    private final String cookieValue;
    private HttpClientWrapper client;

    public TrailBlockEditor(String baseUrl, String cookieValue) {
        this.baseUrl = baseUrl;
        this.cookieValue = cookieValue;

        client = new HttpClientWrapper();
        client.dontCareAboutSSL();
        client.followRedirects();
        client.setHost(baseUrl);
    }

    @Override
    public Cookie authenticationData() {

        String cookieName = "PLAY_SESSION";
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

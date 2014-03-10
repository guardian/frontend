package com.gu.fronts.endtoend.engine;

import hu.meza.aao.RestfulActor;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.cookie.BasicClientCookie2;

import java.util.Date;

public class TrailBlockEditor extends RestfulActor {

    private final String baseUrl;
    private final org.openqa.selenium.Cookie cookie;
    private HttpClientWrapper client;

    public TrailBlockEditor(String baseUrl, org.openqa.selenium.Cookie playSession) {
        this.baseUrl = baseUrl;
        this.cookie = playSession;

        client = new HttpClientWrapper();
        client.dontCareAboutSSL();
        client.followRedirects();
        client.setHost(baseUrl);
    }

    @Override
    public Cookie authenticationData() {

        BasicClientCookie2 authCookie = new BasicClientCookie2(cookie.getName(), cookie.getValue());
        authCookie.setDomain(cookie.getDomain());
        authCookie.setPath(cookie.getPath());
        authCookie.setSecure(cookie.isSecure());
        setExpiry(authCookie);

        return authCookie;
    }

    private void setExpiry(BasicClientCookie2 authCookie) {
        Date expiry = cookie.getExpiry();
        if(expiry==null) return;
        authCookie.setExpiryDate(expiry);
    }

    public void execute(TrailBlockAction action) {
        action.useClient(client);
        action.setAuthenticationData(authenticationData());
        super.execute(action);
    }
}

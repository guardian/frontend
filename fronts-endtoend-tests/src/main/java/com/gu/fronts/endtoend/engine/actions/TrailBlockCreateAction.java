package com.gu.fronts.endtoend.engine.actions;

import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockAction;
import hu.meza.tools.HttpCall;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.HttpStatus;
import org.apache.http.cookie.Cookie;

import java.util.UUID;

public class TrailBlockCreateAction implements TrailBlockAction {
    private final TrailBlock trailBlock;
    private HttpClientWrapper client;
    private HttpCall httpCall;

    public TrailBlockCreateAction(TrailBlock trailBlock) {
        this.trailBlock = trailBlock;
    }

    @Override
    public void setAuthenticationData(Cookie cookie) {
        client.addCookie(cookie);
    }

    @Override
    public void execute() {
        String data = String.format("{" +
                "\"update\":{" +
                "       \"item\":\"%s\"" +
                "       ,\"draft\":true" +
                "       ,\"live\":false" +
                "       ,\"id\": \"%s\"" +
                "   }"+
                "}", anything(), trailBlock.uri()) ;

        final String requestUrl = String.format("/edits");
        httpCall = client.postJsonTo(requestUrl, data);
        return;
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
        int statusCode = httpCall.response().getStatusLine().getStatusCode();

        if (statusCode != HttpStatus.SC_CREATED && statusCode != HttpStatus.SC_OK) {
            return false;
        }

        return true;
    }

    private String anything() {
        return UUID.randomUUID().toString();
    }
}

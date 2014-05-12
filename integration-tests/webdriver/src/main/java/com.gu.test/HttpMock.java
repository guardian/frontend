package com.gu.test;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.github.tomakehurst.wiremock.http.Request;
import com.github.tomakehurst.wiremock.http.RequestListener;
import com.github.tomakehurst.wiremock.http.Response;
import com.github.tomakehurst.wiremock.verification.LoggedRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

public class HttpMock {

    private final WireMockServer wireMockServer;
    private ConcurrentLinkedQueue<LoggedRequest> requests = new ConcurrentLinkedQueue<LoggedRequest>();

    public HttpMock() {
        wireMockServer =
                new WireMockServer(new WireMockConfiguration().port(8080).enableBrowserProxying(true));
    }

    public void startServer() {
        wireMockServer.start();
        wireMockServer.addMockServiceRequestListener(new RequestListener() {
            @Override
            public void requestReceived(Request request, Response response) {
                requests.add(LoggedRequest.createFrom(request));
            }
        });

        Runtime.getRuntime().addShutdownHook(new Thread() {
            @Override
            public void run() {
                stopServer();
            }
        });
    }

    public void stopServer() {
        if (wireMockServer.isRunning()) {
            try {
                wireMockServer.stop();
            } catch (Exception e) {
            }
        }
    }


    public List<LoggedRequest> findAllRequestsTo(String host) {
        List<LoggedRequest> result = new ArrayList<LoggedRequest>();
        for (LoggedRequest request : requests) {
            if (request.getHeader("Host").equals(host)) {
                result.add(request);
            }
        }
        return result;
    }

}

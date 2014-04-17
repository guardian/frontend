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

import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;

public class HttpMock {

	private final WireMockServer wireMockServer;
	private final Configuration config;
	private ConcurrentLinkedQueue<LoggedRequest> requests = new ConcurrentLinkedQueue<LoggedRequest>();

	public HttpMock(Configuration config) {
		this.config = config;

		wireMockServer =
			new WireMockServer(new WireMockConfiguration().port(8080).enableBrowserProxying(true));
	}

	public void start() {
		wireMockServer.start();
		wireMockServer.addMockServiceRequestListener(new RequestListener() {
			@Override
			public void requestReceived(Request request, Response response) {
				requests.add(LoggedRequest.createFrom(request));
			}
		});

	}

	public void stop() {
		wireMockServer.stop();
	}

	public void assertGetRequest(String url) {
		verify(getRequestedFor(urlEqualTo(url)));
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

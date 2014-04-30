package com.gu.test.hooks;

import com.gu.test.HttpMock;
import cucumber.api.java.After;
import cucumber.api.java.Before;

public class WireMockHook {

	private final HttpMock httpMock;

	public WireMockHook(HttpMock httpMock) {
		this.httpMock = httpMock;
	}

	@Before("@httpMock")
	public void startWireMock() {
		httpMock.start();
	}

	@After("@httpMock")
	public void stopWireMock() {
		httpMock.stop();
	}

}

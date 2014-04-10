package com.gu.test;

import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import com.gu.test.actors.Readers;
import cucumber.api.java.en.Then;
import hu.meza.aao.DefaultScenarioContext;

import java.util.List;

public class UserTracking {

	private final Readers readers;
	private final HttpMock httpMock;
	private final DefaultScenarioContext context;

	public UserTracking(Readers readers, HttpMock httpMock, DefaultScenarioContext context) {
		this.readers = readers;
		this.httpMock = httpMock;
		this.context = context;
	}

	@Then("^the correct tracking information should be sent out$")
	public void theCorrectTrackingInformationShouldBeSent() throws Throwable {

		String beacon = "http://beacon.www.theguardian.com/count/pv.gif";

		List<LoggedRequest> requests = httpMock.findAllRequestsTo("hits.theguardian.com");

	}
}

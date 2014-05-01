package com.gu.test;

import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import com.gu.test.actions.asserts.AssertTracking;
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

	@Then("^ophan tracking information should be sent out$")
	public void theCorrectTrackingInformationShouldBeSent() throws Throwable {

		List<LoggedRequest> requests = httpMock.findAllRequestsTo("ophan.theguardian.com");
		String dataComponent = context.getSubject();

		AssertTracking assertTracking = new AssertTracking();
		assertTracking.existsForComponent(dataComponent, requests);

	}


    @Then("^click tracking information should be sent out for show more$")
    public void clickTrackingInformationShouldBeSent() throws Throwable {

        List<LoggedRequest> requests = httpMock.findAllRequestsTo("hits.theguardian.com");
        String dataComponent = "Show more";

        AssertTracking assertTracking = new AssertTracking();
        assertTracking.existsOnButtonClick(dataComponent, requests);

    }

}


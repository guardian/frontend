package com.gu.test;

import cucumber.annotation.en.Given;

public class Steps {

    private final SharedDriver webDriver;

    public Steps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
	
	@Given("^I visit the network front")
	public void i_visit_the_network_front() throws Throwable {
		webDriver.open("/");
	}
	
}
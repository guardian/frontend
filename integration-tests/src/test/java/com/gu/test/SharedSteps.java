package com.gu.test;

import cucumber.annotation.en.Given;

public class SharedSteps {

    private final SharedDriver webDriver;
    
    
    public SharedSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
    
	@Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {
//		//a guardian page
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
	}
	
}
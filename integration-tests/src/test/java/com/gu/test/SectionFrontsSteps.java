package com.gu.test;

import cucumber.annotation.en.Given;

public class SectionFrontsSteps {

	private final SharedDriver webDriver;

	public SectionFrontsSteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
	}

	@Given("^I am on the '(.*)' section front$")
	public void I_am_on_a_section_front(String sectionFront) throws Throwable {
		webDriver.open("/" + sectionFront);
	}
	
}
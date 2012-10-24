package com.gu.test;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;

public class TypographySteps {

	private final SharedDriver webDriver;

	public TypographySteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
	}

	@Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {

	}

	@Then("^the typeface should be rendered as \"([^\"]*)\"$")
	public void the_typeface_should_be_rendered_as(String arg1) throws Throwable {

	}

	@When("^I set the querystring to \"([^\"]*)\"$")
	public void I_set_the_querystring_to(String arg1) throws Throwable {

	}

	@Then("^the typeface should be removed from my local cache$")
	public void the_typeface_should_be_removed_from_my_local_cache() throws Throwable {

	}

	@Then("^the text on the page should be rendered as \"([^\"]*)\"$")
	public void the_text_on_the_page_should_be_rendered_as(String arg1) throws Throwable {

	}

	@Given("^I have the font-family preference set$")
	public void I_have_the_font_family_preference_set() throws Throwable {

	}

	@Given("^the typeface kill-switch is turned on$")
	public void the_typeface_kill_switch_is_turned_on() throws Throwable {

	}

	@Then("^the text on the page should be rendered as \"([^\"]*)\"\"$")
	public void the_text_on_the_page_should_be_rendered_as_(String arg1) throws Throwable {

	}

}
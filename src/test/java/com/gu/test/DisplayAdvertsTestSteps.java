package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.By;

import cucumber.annotation.After;
import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;


public class DisplayAdvertsTestSteps {


	@Given("^I visit any page on the Guardian site$")
	public void I_visit_any_page_on_the_Guardian_site() throws Throwable {
		page = new BrowserCommandsPage();

		//host = article.getHost();
		host = "http://beta.gucode.co.uk"; //cant compile local host

		page.open(host + "/uk/2012/sep/19/police-manchester");
	}

	@Then("^an advert will be at the top of the page$")
	public void an_Advert_will_be_at_the_top_of_the_page() throws Throwable {
		waitFor(1000);
		Assert.assert(page.findElement(By.cssSelector('#ad-slot-top-banner-ad .ad')));
	}

	@Then("^an Advert will be at the foot of the page$")
	public void an_Advert_will_be_at_the_foot_of_the_page() throws Throwable {
		waitFor(1000);
		Assert.assert(page.findElement(By.cssSelector('#ad-slot-bottom-banner-ad .ad')));
	}

	// @When("^I click an advert$")
	// public void I_click_an_advert() throws Throwable {
		
	// }

	// @Then("^the brands site is displayed on a new window$")
	// public void the_brands_site_is_displayed_on_a_new_window() throws Throwable {

	// }

}







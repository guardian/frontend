package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.By;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;


public class DisplayAdvertsTestSteps {


    private final SharedDriver webDriver;

    public DisplayAdvertsTestSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
	
	@Given("^I visit any page on the Guardian site$")
	public void I_visit_any_page_on_the_Guardian_site() throws Throwable {
		
		//a guardian page
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
	}

	@Then("^an advert will be at the top of the page$")
	public void an_Advert_will_be_at_the_top_of_the_page() throws Throwable {
		webDriver.waitFor(1000);
		Assert.assertTrue(webDriver.isElementPresent(By.cssSelector("#ad-slot-top-banner-ad .ad")));
	}

	@Then("^an advert will be at the foot of the page$")
	public void an_advert_will_be_at_the_foot_of_the_page() throws Throwable {
		webDriver.waitFor(1000);
		Assert.assertTrue(webDriver.isElementPresent(By.cssSelector("#ad-slot-bottom-banner-ad .ad")));
	}

}







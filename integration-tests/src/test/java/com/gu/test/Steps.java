package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;

public class Steps {

    private final SharedDriver webDriver;
    
    protected String sectionFrontUrl = "/sport";
    protected String articleUrl = "/football/2012/oct/15/steven-gerrard-england-poland-generation";
    
    public Steps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
	
	@Given("^I visit the network front")
	public void i_visit_the_network_front() throws Throwable {
		webDriver.open("/");
	}
	
	@Given("^I visit a section front")
	public void i_visit_a_section_front() throws Throwable {
		webDriver.open(sectionFrontUrl);
	}
	
	@Given("^I visit an article")
	public void i_visit_an_article() throws Throwable {
		webDriver.open(articleUrl);
	}

	@When("^I refresh the page$")
	public void I_refresh_the_page() throws Throwable {
	    // refresh the page
		webDriver.navigate().refresh();
	}
	
	@Then("^\"(Top stories|Sections)\" tab is (hidden|shown)$")
	public void tab_is(String tabName, String tabState) throws Throwable {
		String tabId = tabName.toLowerCase().replace(" ", "") + "-control-header";
	    WebElement tab = webDriver.findElement(By.id(tabId));
	    // confirm element is shown/hidden
	    Assert.assertEquals(tabState.equals("shown"), tab.isDisplayed());
	}
	
}
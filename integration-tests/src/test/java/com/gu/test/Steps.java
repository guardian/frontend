package com.gu.test;

import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.Assert.*;

public class Steps {

    private final SharedDriver webDriver;
    
    protected String sectionFrontUrl = "/uk-news";
    protected String articleUrl = "/football/2012/oct/15/steven-gerrard-england-poland-generation";
    
    public Steps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
    
    @Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {
		//a guardian page
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
	}
	
	@Given("^I visit the network front")
	public void i_visit_the_network_front() throws Throwable {
		webDriver.open("/uk");
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
	
	@Then("^the \"(Top stories|Sections)\" tab is (hidden|shown)$")
	public void tab_is(String tabName, String tabState) throws Throwable {
		String tabId = "control--" + tabName.toLowerCase().replace(" ", "");
	    WebElement tab = webDriver.waitForElement(By.className(tabId));
	    // confirm element is shown/hidden
	    assertEquals(tabState.equals("shown"), tab.isDisplayed());
	}
	
	@When("^I visit the (.*) jasmine test runner$")
	public void I_visit_the_jasmine_test_runner(String project) throws Throwable {
		// get the frontend project root, if there's a system prop, otherwise assume
		// we're there already
		String frontendRoot = (System.getProperty("frontend.root.dir") != null) 
			? System.getProperty("frontend.root.dir")
			: System.getProperty("user.dir");
			
		// open the appropriate runner
		webDriver.get(
			"file:///" + frontendRoot + "/" + project + "/test/assets/javascripts/runner.html"
		);
		// confirm we're on the correct page
		assertTrue(webDriver.getTitle().contains("Jasmine Spec Runner"));
	}

	@Then("^all the jasmine tests pass$")
	public void all_the_tests_pass() throws Throwable {
		// store the number of tests
		int numOfTests = webDriver.findElements(By.cssSelector("#tests a")).size();
		boolean testFailure = false;
		// run each test
		for (int i = 0; i < numOfTests; i++) {
			WebElement test = webDriver.findElements(By.cssSelector("#tests a")).get(i);
			String testName = test.getText();
			webDriver.click(test);
			// wait for 'duration' element, i.e. end of test (up to 10secs)
            try {
                webDriver.waitForElement(By.cssSelector("#HTMLReporter .banner .duration"), 10);
            } catch (org.openqa.selenium.TimeoutException e) {
              System.out.println("No reporting bar appeared for test at URL: "+ webDriver.getCurrentUrl());
              throw new Exception("Reporting bar did not appear");
            }


            // get any error messages
			List<WebElement> alertBar = webDriver.findElements(By.cssSelector("span.failingAlert.bar"));
			if (alertBar.size() != 0) {
				System.out.println(testName + " - " + alertBar.get(0).getText());
				for (WebElement error : webDriver.findElements(By.className("specDetail"))) {
					System.out.println(" > " + error.findElement(By.className("description")).getText());
					for (WebElement errorMsg : error.findElements(By.className("resultMessage"))) {
						System.out.println("    " + errorMsg.getText());
					}
				}
				testFailure = true;
			}
		}
		
		assertFalse(testFailure);
	}
	
}
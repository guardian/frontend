package com.gu.test;

import java.util.*;
import java.text.SimpleDateFormat;
import org.openqa.selenium.*;
import cucumber.annotation.After;
import cucumber.annotation.en.*;
import cucumber.runtime.PendingException;
import junit.framework.Assert;

public class FootballTestSteps {

	private FootballTestPage fendadmin;

	@Given("^I visit the (results|fixtures) page$")
	public void I_visit_a_page(String matchesType) throws Throwable {
		fendadmin = new FootballTestPage();
		fendadmin.open(fendadmin.getHost() + "/football/" + matchesType);
	}
	
	@Given("^I visit the (results|fixtures) page for (\\d{2}/\\d{2}/\\d{4})$")
	public void I_visit_a_dated_page(String matchesType, String date) throws Throwable {
		// convert date to correct format
		Date parsedDate = new SimpleDateFormat("dd/MM/yyyy").parse(date);
		String formattedDate = new SimpleDateFormat("yyyy/MMM/dd").format(parsedDate).toLowerCase();
		// load page
		I_visit_a_page(matchesType + "/" + formattedDate);
	}
	
	@Given("^I visit the '(.+)' (results|fixtures) page for (\\d{2}/\\d{2}/\\d{4})$")
	public void I_visit_a_competition_dated_page(String competition, String matchesType, String date) throws Throwable {
		// load page
		I_visit_a_dated_page(competition + "/" + matchesType, date);
	}
	
	@When("^I click '(.+)'$")
	public void I_click(String linkText) throws Throwable {
		fendadmin.clickButton(By.linkText(linkText));
	}

	@Then("^I should see (\\d+) days worth of (results|fixtures)$")
	public void I_should_see_days_worth_of(int numOfDays, String matchesType) throws Throwable {
		System.out.println(fendadmin.getDriver());
		List<WebElement> competitions = fendadmin.getDriver().findElements(By.className("competitions"));
		Assert.assertEquals(numOfDays, competitions.size());
	}
	
	@Then("^I should see the following (\\d+) days worth of (results|fixtures)$")
	public void I_should_see_the_following_days_worth_of(int numOfDays, String matchesType) throws Throwable {
		// should now have twice as many days worth of results
		I_should_see_days_worth_of(numOfDays * 2, matchesType);
	}

	@After
	public void tearDown(){
		fendadmin.close();
	}
}

package com.gu.test;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;

public class FootballSteps {

    private final SharedDriver webDriver;

    public FootballSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

	@Given("^I visit the (results|fixtures) page$")
	public void I_visit_a_page(String matchesType) throws Throwable {
		webDriver.open("/football/" + matchesType);
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
		webDriver.clickButton(By.linkText(linkText));
	}

	@Then("^I should see (\\d+) days worth of (results|fixtures)$")
	public void I_should_see_days_worth_of(int numOfDays, String matchesType) throws Throwable {
		List<WebElement> competitions = webDriver.findElements(By.className("competitions"));
		Assert.assertEquals(numOfDays, competitions.size());
	}
	
	@Then("^I should see the following (\\d+) days worth of (results|fixtures)$")
	public void I_should_see_the_following_days_worth_of(int numOfDays, String matchesType) throws Throwable {
		// should now have twice as many days worth of results
		I_should_see_days_worth_of(numOfDays * 2, matchesType);
	}
	
}
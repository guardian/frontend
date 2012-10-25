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
import cucumber.runtime.PendingException;

public class FootballSteps {

    private final SharedDriver webDriver;

    public FootballSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

	@Given("^I visit the \"([^\"]*)\" (results|fixtures) page$")
	public void I_visit_a_page(String competition, String matchesType) throws Throwable {
		String url = "/football/";
		if (!competition.equals("all")) {
			url += competition + "/";
		}
		url += matchesType;
		webDriver.open(url);
	}
	
	@Given("^I visit the \"([^\"]*)\" (results|fixtures) page for (\\d{2}/\\d{2}/\\d{4})$")
	public void I_visit_a_dated_page(String competition, String matchesType, String date) throws Throwable {
		// convert date to correct format
		Date parsedDate = new SimpleDateFormat("dd/MM/yyyy").parse(date);
		String formattedDate = new SimpleDateFormat("yyyy/MMM/dd").format(parsedDate).toLowerCase();
		// load page
		I_visit_a_page(competition, matchesType + "/" + formattedDate);
	}
	
	@When("^I click the competition filter expander$")
	public void I_click_the_competition_filter_expander() throws Throwable {
	    webDriver.findElement(By.cssSelector("h1 i")).click();
	}

	@Then("^the competition filter list opens$")
	public void the_competition_filter_list_opens() throws Throwable {
	    Assert.assertTrue(webDriver.isVisibleWait(By.id("js-football-league-list")));
	}

	@Given("^the competition filter list is open$")
	public void the_competition_filter_list_is_open() throws Throwable {
	    // Express the Regexp above with the code you wish you had
	    throw new PendingException();
	}

	@Then("^the competition filter list closes$")
	public void the_competition_filter_list_closes() throws Throwable {
	    Assert.assertTrue(webDriver.isHiddenWait(By.id("js-football-league-list")));
	}
	
	@When("^I click \"(.+)\"$")
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
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
    
    @Given("^I visit the live match page$")
	public void I_visit_the_live_match_page() throws Throwable {
	    webDriver.open("/football/live");
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
	
	@Given("^I visit the \"([^\"]*)\" (results|fixtures) page for today$")
	public void I_visit_a_page_for_today(String competition, String matchesType) throws Throwable {
		// load page
		I_visit_a_page(competition, matchesType);
	}
	
	@When("^I click the competition filter expander$")
	public void I_click_the_competition_filter_expander() throws Throwable {
	    webDriver.findElement(By.cssSelector("h1 i")).click();
	}

	@Then("^the competition filter list opens$")
	public void the_competition_filter_list_opens() throws Throwable {
	    Assert.assertTrue(webDriver.isVisibleWait(By.id("js-football-league-list")));
	}

	@Then("^the competition filter list closes$")
	public void the_competition_filter_list_closes() throws Throwable {
	    Assert.assertTrue(webDriver.isHiddenWait(By.id("js-football-league-list")));
	}
	
	@When("^I click \"(.+)\"$")
	public void I_click(String linkText) throws Throwable {
		webDriver.clickButton(By.linkText(linkText));
	}

	@Then("^(\\d+) days worth of (results|fixtures) should load in$")
	public void I_should_see_the_following_days_worth_of(int numOfDays, String matchesType) throws Throwable {
		// should now have twice as many days worth of results
		List<WebElement> competitions = webDriver.findElements(By.className("competitions"));
		Assert.assertEquals(numOfDays, competitions.size() - numOfDays);
	}
	
	@Then("^there should be an auto-update component$")
	public void there_should_be_an_auto_update_component() throws Throwable {
	    webDriver.findElementWait(By.cssSelector(".update .update-text"));
	}

	@Then("^auto-update should be on$")
	public void auto_update_should_be_on() throws Throwable {
		WebElement autoUpdate = webDriver.findElement(By.className("update"));
	    WebElement selectedButton = autoUpdate.findElement(By.className("is-active"));
	    Assert.assertEquals("on", selectedButton.getAttribute("data-action"));
	}

	@Then("^the matches should update every (\\d+) seconds$")
	public void the_matches_should_update_every_seconds(int secs) throws Throwable {
		// wait the update time
		Thread.sleep(secs * 1000);
	    // matches container should now have a last-updated data attribute
		webDriver.findElementWait(By.cssSelector(".matches-container[data-last-updated]"));
	}
	
	@Then("^I click the auto-update off button$")
	public void I_should_be_able_to_turn_auto_update_off() throws Throwable {
		WebElement autoUpdate = webDriver.findElement(By.className("update"));
		// get the off button
		WebElement offButton = autoUpdate.findElement(By.cssSelector("button[data-action='off']"));
		offButton.click();
	}

	@Then("^auto-update should be off$")
	public void auto_update_should_be_off() throws Throwable {
	    WebElement offButton = webDriver.findElement(By.cssSelector(".update button[data-action='off']"));
	    Assert.assertTrue(offButton.getAttribute("class").contains("is-active"));
	}

	@Given("^I visit any Football league and/or Domestic competition tag page$")
	public void I_visit_any_Football_league_and_or_Domestic_competition_tag_page() throws Throwable {
	    webDriver.open("/football/premierleague");
	}
	
	@Then("^there should be a table component$")
	public void there_should_be_a_table_component() throws Throwable {
		webDriver.findElementWait(By.id("front-competition-table"));
	}

	@Then("^table should show the top (\\d+) teams$")
	public void table_should_show_the_top_teams(int teams) throws Throwable {
	    List<WebElement> rows = webDriver.findElements(By.cssSelector(".table-football-body tr"));
		Assert.assertEquals(teams, rows.size());
	}

	@Then("^there should be a link to \"([^\"]*)\"$")
	public void there_should_be_a_link_to(String linkText) throws Throwable {
		webDriver.findElement(By.linkText(linkText));
	}
}
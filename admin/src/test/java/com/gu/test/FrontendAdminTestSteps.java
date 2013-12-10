package com.gu.test;

import org.openqa.selenium.By;
import cucumber.api.java.After;
import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import cucumber.runtime.PendingException;
import static org.junit.Assert.*;

public class FrontendAdminTestSteps {

	private FrontendAdminTestPage fendadmin;

	@Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {
		fendadmin = new FrontendAdminTestPage();
		fendadmin.open(fendadmin.getHost() + "/admin");
	}

	@When("^I am not logged in$")
	public void I_am_not_logged_in() throws Throwable {
		// delete PLAY_SESSION cookie
		fendadmin.deleteCookieNamed("PLAY_SESSION");
	}

	@Then("^I should be prompted to log in$")
	public void I_should_be_prompted_to_log_in() throws Throwable {
		// confirm there is a login button
		assertTrue("Login button does not exist", fendadmin.isElementPresent(By.id("login-button")));
	}

	@Given("^I am logged in$")
	public void I_am_logged_in() throws Throwable {
		// checked we're not already logged in - is there a login button
		if (fendadmin.isElementPresent(By.id("login-button"))) {
			// click login button
			fendadmin.clickButton(By.id("login-button"));
			
			// enter the user's details
			fendadmin.type(By.name("Email"), System.getProperty("google.username"));
			fendadmin.type(By.name("Passwd"), System.getProperty("google.password"));

			// submit the form
			fendadmin.submit(By.id("gaia_loginform"));

			//1st time google asks to approve the url for the email account
			fendadmin.checkApproveButton();	
			
			// confirm there are no error messages			
			if (fendadmin.isElementPresent((By.className("errormsg")))) {
				fail("Unable to log in - ");
			}
		}
	}

	@When("^I click the logged out button$")
	public void I_click_the_logged_out_button() throws Throwable {
		fendadmin.clickButton(By.id("logout-button"));		
	}

	@Then("^I should be logged out$")
	public void I_should_be_logged_out() throws Throwable {
		fendadmin.clickButton(By.id("login-button"));
	}

	@Given("^are no configured special events$")
	public void are_no_configured_special_events() throws Throwable {
		// TODO - how do we clear the db?

		fendadmin.waitForTextPresent("UK Edition");
		fendadmin.clickButton(By.id("clear-frontend"));
		fendadmin.clickButton(By.id("save-frontend"));

		// wait for save success alert
		fendadmin.waitForElementPresent(By.className("alert-success"));

		// reload the page
		fendadmin.refresh();
		
		// confirm data is empty, look at json in source
		if (fendadmin.getPageSource("var frontConfig = {\"uk\":{\"blocks\":[]},\"us\":{\"blocks\":[]}};") == -1) {
			fail("Unable to clear data");
		}
	}

	@When("^I am on the editor page$")
	public void I_am_on_the_editor_page() throws Throwable {
		fendadmin.open(fendadmin.getHost() + "/admin/feature-trailblock");
	}

	@Then("^I should see an empty form$")
	public void I_should_see_an_empty_form() throws Throwable {
		fendadmin.checkFormIsEmpty();
	}

	@When("^I enter a tag id '(.*)'$")
	public void I_enter_a_tag_id_sport_tagId(String tagId) throws Throwable {
		fendadmin.type(By.name("tag-id"), tagId);
	}

	@When("^click 'save'$")
	public void click_save() throws Throwable {
		fendadmin.clickButton(By.id("save-frontend"));
	}

	@Then("^the configuration should be saved$")
	public void the_configuration_should_be_saved() throws Throwable {
		fendadmin.isElementPresent(By.className("alert-success"));
	}

	@When("^I enter an non-existant tag$")
	public void I_enter_an_non_existant_tag() throws Throwable {
		this.I_enter_a_tag_id_sport_tagId("foo/bar");
		// TODO - need to re-run validation on save - how with events?
		fendadmin.isElementPresent(By.className("invalid"));
	}

	@Then("^then configuraiton should not be saved$")
	public void then_configuraiton_should_not_be_saved() throws Throwable {
		fendadmin.isElementPresent(By.className("alert-error"));
	}

	@When("^the was an error saving$")
	public void the_was_an_error_saving() throws Throwable {
		new PendingException();
	}

	@Then("^the user should be told the configuration has not been saved$")
	public void the_user_should_be_told_the_configuration_has_not_been_saved() throws Throwable {
		new PendingException();
	}

	@Given("^there is an existing event called '(.*)'$")
	public void there_is_an_existing_event_called_tagId(String tagId) throws Throwable {
		this.I_enter_a_tag_id_sport_tagId(tagId);
		this.click_save();
		this.the_configuration_should_be_saved();
	}

	@When("^I click 'clear'$")
	public void I_click_clear() throws Throwable {
		fendadmin.clickButton(By.id("clear-frontend"));
	}

	@Then("^the event should be removed$")
	public void the_event_should_be_removed() throws Throwable {
		this.I_should_see_an_empty_form();
		
		// reload the page
		fendadmin.refresh();
		
		// confirm data is empty, look at json in source		
		if (fendadmin.getPageSource("var frontConfig = {\"uk\":{\"blocks\":[]},\"us\":{\"blocks\":[]}};") == -1) {
			fail("Unable to clear data");
		}
	}

	@After
	public void tearDown(){
		fendadmin.close();
	}
}

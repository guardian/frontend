package com.gu.test;

import cucumber.annotation.After;
import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;


public class ArticleTestSteps {

	private ArticleTestPage article;
	private String host;

	@Given("^I am on an article page$")
	public void I_am_on_an_article_page() throws Throwable {
		
		article = new ArticleTestPage();
		//host = article.getHost();
		host = "http://www.gucode.co.uk"; //cant compile local host

		article.open(host + "/uk/2012/sep/19/police-manchester");

	}

	@When("^the article has a story package$")
	public void the_article_has_a_story_package() throws Throwable {

	}

	@Then("^\"([^\"]*)\" is displayed$")
	public void is_displayed(String arg1) throws Throwable {

	}

	@When("^the article has no story package$")
	public void the_article_has_no_story_package() throws Throwable {

	}

	@Then("^\"([^\"]*)\" \"([^\"]*)\" displayed$")
	public void displayed(String arg1, String arg2) throws Throwable {

	}

	@When("^\"([^\"]*)\" is unavailable$")
	public void is_unavailable(String arg1) throws Throwable {

	}

	@Then("^\"([^\"]*)\" section tab correlates to the article section$")
	public void section_tab_correlates_to_the_article_section(String arg1) throws Throwable {

	}

	@When("^I click the \"([^\"]*)\" tabs$")
	public void I_click_the_tabs(String arg1) throws Throwable {

	}

	@Then("^I can toggle between the section tab and guardian.co.uk tab$")
	public void I_can_toggle_between_the_section_tab_and_guardian_co_uk_tab() throws Throwable {

	}

	@When("^I click \"([^\"]*)\" tab at the top of the page$")
	public void I_click_tab_at_the_top_of_the_page(String arg1) throws Throwable {

	}

	@Then("^a list of \"([^\"]*)\" opens$")
	public void a_list_of_opens(String arg1) throws Throwable {

	}

	@Then("^another click on \"([^\"]*)\" closes the list.$")
	public void another_click_on_closes_the_list(String arg1) throws Throwable {

	}

	@When("^I click \"([^\"]*)\" tab at the foot of the page$")
	public void I_click_tab_at_the_foot_of_the_page(String arg1) throws Throwable {

	}

	@Given("^at the top of the page$")
	public void at_the_top_of_the_page() throws Throwable {

	}

	@When("^I click the \"([^\"]*)\" navigation tab$")
	public void I_click_the_navigation_tab(String arg1) throws Throwable {

	}

	@Then("^another click on \"([^\"]*)\" tab closes the list$")
	public void another_click_on_tab_closes_the_list(String arg1) throws Throwable {

	}

	@Given("^at the foot of the page$")
	public void at_the_foot_of_the_page() throws Throwable {

	}

	@When("^I click an article with article image$")
	public void I_click_an_article_with_article_image() throws Throwable {

	}

	@Then("^the \"([^\"]*)\" page is displayed$")
	public void the_page_is_displayed(String arg1) throws Throwable {

	}

	@Then("^the article will have an article image and caption$")
	public void the_article_will_have_an_article_image_and_caption() throws Throwable {

	}

	@After
	public void tearDown(){
		article.close();
	}
}







package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.By;

import cucumber.annotation.After;
import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;


public class ArticleTestSteps {

	private BrowserCommandsPage article;
	private String host;

	@Given("^I am on an article page$")
	public void I_am_on_an_article_page() throws Throwable {
		
		article = new BrowserCommandsPage();
		//host = article.getHost();
		host = "http://beta.gucode.co.uk"; //cant compile local host

		article.open(host + "/uk/2012/sep/19/police-manchester");

	}

	@When("^the article has a story package$")
	public void the_article_has_a_story_package() throws Throwable {
		article.open(host + "/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
		
	}

	@Then("^\"([^\"]*)\" is displayed$")
	public void is_displayed(String arg1) throws Throwable {
		article.isTextPresentByElement(By.id("related-trails"), arg1);
	}

	@When("^the article has no story package$")
	public void the_article_has_no_story_package() throws Throwable {
		article.open(host + "/sport/2012/jul/27/london-2012-team-gb-clark-lenzly");
	}

	@Then("^\"([^\"]*)\" \"([^\"]*)\" displayed$")
	public void displayed(String arg1, String arg2) throws Throwable {
		article.isTextPresentByElement(By.id("related-trails"), arg1);
	}

	@When("^\"([^\"]*)\" is unavailable$")
	public void is_unavailable(String arg1) throws Throwable {
		article.open(host + "/help/terms-of-service");
		
	}

	@Then("^\"([^\"]*)\" is not displayed$")
	public void is_not_displayed(String arg1) throws Throwable {
		Assert.assertFalse(article.isElementPresent(By.id("related-trails")));
	}
	
	@When("^I open a \"([^\"]*)\" article$")
	public void I_open_a_article(String arg1) throws Throwable {
		article.open(host + "/sport/2012/jul/27/london-2012-team-gb-clark-lenzly");
	}

	@Then("^\"([^\"]*)\" section tab show read \"([^\"]*)\"$")
	public void section_tab_show_read(String arg1, String arg2) throws Throwable {
		article.isTextPresentByElement(By.className("tabs-selected"), arg2);
	}
	

	@When("^I select sectional \"([^\"]*)\"$")
	public void I_select_sectional(String arg1) throws Throwable {
		article.clickLink("guardian.co.uk");
	}
	
	@When("^I select pan-site \"([^\"]*)\"$")
	public void I_select_pan_site(String arg1) throws Throwable {
		article.click(By.cssSelector("#js-popular-tabs > li > a"));
	}
	
	@Then("^I can see a list of the most popular stories on guardian.co.uk for the section I am in$")
	public void I_can_see_list_popular_stories_on_guardian_for_the_section_i_am_in() throws Throwable {
		String ret = article.getDriver().findElement(By.id("tabs-popular-2")).getCssValue("display");
		Assert.assertEquals("block", ret);
	}

	@Then("^I can see a list of the most popular stories on guardian.co.uk for the whole guardian site$")
	public void I_can_see_a_list_of_the_most_popular_stories_on_guardian_co_uk_for_the_whole_guardian_site() throws Throwable {
		String ret = article.getDriver().findElement(By.id("tabs-popular-1")).getCssValue("display");
		Assert.assertEquals("block", ret);
		
	}
	
	@When("^I click \"([^\"]*)\" tab at the top of the page$")
	public void I_click_tab_at_the_top_of_the_page(String arg1) throws Throwable {
		article.clickLink(arg1);
	}

	@Then("^a list of \"([^\"]*)\" opens$")
	public void a_list_of_opens(String arg1) throws Throwable {
		String ret = article.getDriver().findElement(By.id("topstories-header")).getCssValue("display");
		Assert.assertEquals("block", ret);
	}

	@Then("^another click on \"([^\"]*)\" closes the list.$")
	public void another_click_on_closes_the_list(String arg1) throws Throwable {
		article.clickLink(arg1);
		String ret = article.getDriver().findElement(By.id("topstories-header")).getCssValue("display");
		Assert.assertEquals("none", ret);
	}

	@When("^I click \"([^\"]*)\" tab at the foot of the page$")
	public void I_click_tab_at_the_foot_of_the_page(String arg1) throws Throwable {
		article.getDriver().findElement(By.id("topstories-control-footer")).click();
	}
	
	@Then("^a list of the footer \"([^\"]*)\" opens$")
	public void a_list_of_the_footer_opens(String arg1) throws Throwable {
		String ret = article.getDriver().findElement(By.id("topstories-footer")).getCssValue("display");
		Assert.assertEquals("block", ret);
	}
	
	@Then("^another click on the footer \"([^\"]*)\" closes the list.$")
	public void another_click_on_the_footer_closes_the_list(String arg1) throws Throwable {
		article.getDriver().findElement(By.id("topstories-control-footer")).click();
		String ret = article.getDriver().findElement(By.id("topstories-footer")).getCssValue("display");
		Assert.assertEquals("none", ret);
	}

	@When("^I select the sections navigation button$")
	public void I_select_the_sections_navigation_button( ) throws Throwable {
		article.getDriver().findElement(By.id("sections-control-header")).click();
	}

	@Then("^it should show me a list of sections$")
	public void it_should_show_a_list_of_sections() throws Throwable {
		String ret = article.getDriver().findElement(By.id("sections-header")).getCssValue("display");
		Assert.assertEquals("block", ret);
	}
	
	@Then("^another click on the \"([^\"]*)\" \"([^\"]*)\" tab closes the list$")
	public void another_click_on_the_tab_closes_the_list(String arg1, String arg2) throws Throwable {
		article.getDriver().findElement(By.id("sections-control-" + arg1)).click();
		String ret = article.getDriver().findElement(By.id("sections-" + arg1)).getCssValue("display");
		Assert.assertEquals("none", ret);
	}
	
	@When("^I click an article with article image$")
	public void I_click_an_article_with_article_image() throws Throwable {

	}


	@Then("^a list of bottom \"([^\"]*)\" opens in the \"([^\"]*)\"$")
	public void a_list_of_bottom_opens_in_the(String arg1, String arg2) throws Throwable {

	}

	@When("^the article has an article image$")
	public void the_article_has_an_article_image() throws Throwable {

	}

	@When("^the user's connection speed is fast$")
	public void the_user_s_connection_speed_is_fast() throws Throwable {

	}

	@Then("^article high resolution image and caption is displayed$")
	public void article_high_resolution_image_and_caption_is_displayed() throws Throwable {

	}

	@When("^\"([^\"]*)\" has expanders$")
	public void has_expanders(String arg1) throws Throwable {

	}

	@Then("^I can expand and collapse expanders$")
	public void I_can_expand_and_collapse_expanders() throws Throwable {

	}

	@Given("^I have visited some top stories$")
	public void I_have_visited_some_top_stories() throws Throwable {

	}

	@Then("^the articles I have visited will be in a visited state$")
	public void the_articles_I_have_visited_will_be_in_a_visited_state() throws Throwable {

	}

	
	@After
	public void tearDown(){
		article.closeAll();
	}
}







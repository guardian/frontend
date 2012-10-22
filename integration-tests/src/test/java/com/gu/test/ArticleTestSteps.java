package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;


public class ArticleTestSteps {
	
	
    private final SharedDriver webDriver;

    public ArticleTestSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
	
    @Given("^I am on the article page$")
    public void I_am_on_the_article_page() throws Throwable {
		webDriver.open("/");
    }
	
	@When("^the article has a story package$")
	public void the_article_has_a_story_package() throws Throwable {
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
	}

	@Then("^\"([^\"]*)\" is displayed$")
	public void is_displayed(String headerText) throws Throwable {
		WebElement relatedHeader = webDriver.findElementWait(By.cssSelector("#related-trails h3"));
		Assert.assertEquals(headerText, relatedHeader.getText());
	}

	@When("^the article has no story package$")
	public void the_article_has_no_story_package() throws Throwable {
		webDriver.open("/sport/2012/jul/27/london-2012-team-gb-clark-lenzly");
	}

	@Then("^\"([^\"]*)\" \"([^\"]*)\" displayed$")
	public void displayed(String arg1, String arg2) throws Throwable {
		webDriver.isTextPresentByElement(By.id("related-trails"), arg1);
	}

	@When("^\"([^\"]*)\" is unavailable$")
	public void is_unavailable(String arg1) throws Throwable {
		webDriver.open("/help/terms-of-service");
	}

	@Then("^\"([^\"]*)\" is not displayed$")
	public void is_not_displayed(String arg1) throws Throwable {
		Assert.assertFalse(webDriver.isElementPresent(By.id("related-trails")));
	}
	
	@When("^I open a \"([^\"]*)\" article$")
	public void I_open_a_article(String arg1) throws Throwable {
		webDriver.open("/sport/2012/jul/27/london-2012-team-gb-clark-lenzly");
	}

	@Then("^\"([^\"]*)\" section tab show read \"([^\"]*)\"$")
	public void section_tab_show_read(String arg1, String arg2) throws Throwable {
		Assert.assertTrue(webDriver.isTextPresentByElement(By.className("tabs-selected"), arg2));
	}
	

	@When("^I select sectional \"([^\"]*)\"$")
	public void I_select_sectional(String arg1) throws Throwable {
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
		webDriver.clickLink("guardian.co.uk");
	}
	
	@When("^I select pan-site \"([^\"]*)\"$")
	public void I_select_pan_site(String arg1) throws Throwable {
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
		webDriver.click(By.cssSelector("#js-popular-tabs > li > a"));

	}
	
	@Then("^I can see a list of the most popular stories on guardian.co.uk for the section I am in$")
	public void I_can_see_list_popular_stories_on_guardian_for_the_section_i_am_in() throws Throwable {
		Assert.assertEquals("block", webDriver.getelementCssValue(By.id("tabs-popular-2"), "display"));
	}

	@Then("^I can see a list of the most popular stories on guardian.co.uk for the whole guardian site$")
	public void I_can_see_a_list_of_the_most_popular_stories_on_guardian_co_uk_for_the_whole_guardian_site() throws Throwable {
		Assert.assertEquals("block", webDriver.getelementCssValue(By.id("tabs-popular-1"), "display"));
	}
	
	@When("^I click \"([^\"]*)\" tab at the top of the page$")
	public void I_click_tab_at_the_top_of_the_page(String arg1) throws Throwable {
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
		webDriver.clickLink(arg1);
	}

	@Then("^a list of \"([^\"]*)\" opens$")
	public void a_list_of_opens(String arg1) throws Throwable {
		Assert.assertEquals("block", webDriver.getelementCssValue(By.id("topstories-header"), "display"));
	}

	@Then("^another click on \"([^\"]*)\" closes the list.$")
	public void another_click_on_closes_the_list(String arg1) throws Throwable {
		webDriver.clickLink(arg1);
		Assert.assertEquals("none", webDriver.getelementCssValue(By.id("topstories-header"), "display"));
	}

	@When("^I click \"([^\"]*)\" tab at the foot of the page$")
	public void I_click_tab_at_the_foot_of_the_page(String arg1) throws Throwable {
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
		webDriver.findElement(By.id("topstories-control-footer")).click();
	}
	
	@Then("^a list of the footer \"([^\"]*)\" opens$")
	public void a_list_of_the_footer_opens(String arg1) throws Throwable {
		Assert.assertEquals("block", webDriver.getelementCssValue(By.id("topstories-footer"), "display"));
	}
	
	@Then("^another click on the footer \"([^\"]*)\" closes the list.$")
	public void another_click_on_the_footer_closes_the_list(String arg1) throws Throwable {
		webDriver.click(By.id("topstories-control-footer"));
		Assert.assertEquals("none", webDriver.getelementCssValue(By.id("topstories-footer"), "display"));
	}

	@When("^I select the sections navigation button$")
	public void I_select_the_sections_navigation_button( ) throws Throwable {
		webDriver.click(By.id("sections-control-header"));
	}

	@Then("^it should show me a list of sections$")
	public void it_should_show_a_list_of_sections() throws Throwable {
		Assert.assertEquals("block", webDriver.getelementCssValue(By.id("sections-header"), "display"));
	}
	
	@Then("^another click on the \"([^\"]*)\" \"([^\"]*)\" tab closes the list$")
	public void another_click_on_the_tab_closes_the_list(String arg1, String arg2) throws Throwable {
		webDriver.click(By.id("sections-control-" + arg1));
		Assert.assertEquals("none", webDriver.getelementCssValue(By.id("sections-" + arg1), "display"));
	}

	@When("^the article has an article image$")
	public void the_article_has_an_article_image() throws Throwable {
		webDriver.open("/technology/2012/oct/15/google-privacy-policy");
	}

	@When("^I have a fast connection speed$")
	public void I_have_a_fast_connection_speed() throws Throwable {
			//TODO:
	}

	@Then("^the high resolution version of the image is displayed$")
	public void article_high_resolution_image_and_caption_is_displayed() throws Throwable {
		webDriver.waitFor(1000);
		Assert.assertTrue(webDriver.isElementPresent(By.className("image-high")));
	}

	@When("^\"([^\"]*)\" has expanders$")
	public void has_expanders(String arg1) throws Throwable {
		webDriver.open("/football/blog/2012/may/10/signing-of-season-premier-league");
	}

	@Then("^I can expand and collapse expanders$")
	public void I_can_expand_and_collapse_expanders() throws Throwable {
		webDriver.click(By.className("cta"));
		webDriver.waitFor(1000);
		Assert.assertFalse(webDriver.isElementPresent(By.cssSelector("#related-trails.shut")));
	}
}

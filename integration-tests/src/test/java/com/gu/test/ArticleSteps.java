package com.gu.test;

import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import junitx.framework.StringAssert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;


public class ArticleSteps {

	private final SharedDriver webDriver;
	
	protected String articleWithStoryPackage = "/sport/2012/oct/10/icc-suspends-umpires-corruption-claims";
	protected String articleWithoutStoryPackage = "/sport/2012/jul/27/london-2012-team-gb-clark-lenzly";
	protected String sportArticle = "/sport/2012/jul/27/london-2012-team-gb-clark-lenzly";
	protected String article = "/sport/2012/oct/10/icc-suspends-umpires-corruption-claims";
	protected String articleWithImage = "/technology/2012/oct/15/google-privacy-policy";
	protected String articleWithMoreExapnders = "/world/2013/jun/17/turkish-trade-unions-call-for-strike";
	protected String articleWithRelatedExapnders = "/world/2012/oct/07/venezuela-voters-chavez";
	protected Map<String, String> datedArticles = new HashMap<String, String>();
	
	public ArticleSteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
		// set up a map of dated articles
		datedArticles.put("2012-11-10", "/world/2012/nov/08/syria-arms-embargo-rebel");
		datedArticles.put("2012-08-19", "/business/2012/aug/19/shell-spending-security-nigeria-leak");
	}
	
	@Given("^I am on an article$")
	public void I_am_on_an_article() throws Throwable {
		webDriver.open(article);
	}

	@Given("^I am on an article with a story package$")
	public void I_am_on_an_article_with_a_story_package() throws Throwable {
		webDriver.open(articleWithStoryPackage);
	}
	
	@Given("^I am on an article without a story package$")
	public void I_am_on_an_article_without_a_story_package() throws Throwable {
		webDriver.open(articleWithoutStoryPackage);
	}

	@Given("^I open a \"sport\" article$")
	public void I_open_a_article() throws Throwable {
		webDriver.open(sportArticle);
	}
	
	@Given("^I am on an article with an image$")
	public void I_am_on_an_article_with_an_image() throws Throwable {
		webDriver.open(articleWithImage);
	}
	
	@Given("^I am on an article with expanders for \"More on this story\"$")
	public void I_am_on_an_article_with_exapnders_for_more_on_this_story() throws Throwable {
		webDriver.open(articleWithMoreExapnders);
	}
	
	@Given("^I am on an article with expanders for \"Related content\"$")
	public void I_am_on_an_article_with_exapnders_for_related_content() throws Throwable {
		webDriver.open(articleWithRelatedExapnders);
	}
	
	@Given("^I am on an article published on '([^']*)'$")
	public void I_am_on_an_article_published_on(String date) throws Throwable {
		// open an article for this date
		webDriver.open(datedArticles.get(date));
	} 

	@Then("^\"([^\"]*)\" is displayed$")
	public void is_displayed(String headerText) throws Throwable {
		WebElement relatedHeader = webDriver.waitForElement(By.cssSelector("aside h3"));
		assertEquals(headerText, relatedHeader.getText());
	}

	@Then("^\"([^\"]*)\" \"([^\"]*)\" displayed$")
	public void displayed(String arg1, String arg2) throws Throwable {
		webDriver.isTextPresentByElement(By.id("related-trails"), arg1);
	}

	@When("^I select the sectional \"([^\"]*)\"$")
	public void I_select_sectional(String arg1) throws Throwable {
        By sectionalMostPopular=(By.xpath("//*[@id='js-popular-tabs']/li[2]/a"));
		webDriver.jsClick(webDriver.findElement(sectionalMostPopular));
	}

	@When("^I select the pan-site \"([^\"]*)\"$")
	public void I_select_pan_site(String arg1) throws Throwable {
        By panSiteMostPopular=(By.xpath("//*[@id='js-popular-tabs']/li[1]/a"));
		webDriver.jsClick(webDriver.findElement(panSiteMostPopular));
	}

	@Then("^I can see a list of the most popular stories on guardian.co.uk for the section I am in$")
	public void I_can_see_list_popular_stories_on_guardian_for_the_section_i_am_in() throws Throwable {
		assertEquals("block", webDriver.getElementCssValue(By.id("tabs-popular-2"), "display"));
	}

	@Then("^I can see a list of the most popular stories on guardian.co.uk for the whole guardian site$")
	public void I_can_see_a_list_of_the_most_popular_stories_on_guardian_co_uk_for_the_whole_guardian_site() throws Throwable {
		assertEquals("block", webDriver.getElementCssValue(By.id("tabs-popular-1"), "display"));
	}
	
	@When("^\"([^\"]*)\" is unavailable$")
	public void is_unavailable(String arg1) throws Throwable {
		webDriver.open("/help/terms-of-service");
	}

	@Then("^\"([^\"]*)\" is not displayed$")
	public void is_not_displayed(String arg1) throws Throwable {
		assertTrue(webDriver.findElements(By.id("related-trails")).size() == 0);
	}

	@Then("^\"([^\"]*)\" section tab show read \"([^\"]*)\"$")
	public void section_tab_show_read(String arg1, String arg2) throws Throwable {
        webDriver.waitForElement(By.className("tabs__tab--selected"));
		assertTrue(webDriver.isTextPresentByElement(By.className("tabs__tab--selected"), arg2));
	}

	@When("^I click \"([^\"]*)\" tab at the top of the page$")
	public void I_click_tab_at_the_top_of_the_page(String linkText) throws Throwable {
		webDriver.click(webDriver.findElement(By.linkText(linkText)));
	}

	@Then("^a list of \"([^\"]*)\" opens$")
	public void a_list_of_opens(String arg1) throws Throwable {
		// wait for top stories panel to open
		assertTrue(webDriver.waitForCss(By.id("topstories-header"), "display", "block"));
	}

	@Then("^another click on \"([^\"]*)\" closes the list.$")
	public void another_click_on_closes_the_list(String linkText) throws Throwable {
		// NOTE - HACKY! need to force wait 400ms wait, as can't click on again any quicker
		Thread.sleep(500);
		// click the tab
		webDriver.click(webDriver.findElement(By.linkText(linkText)));
		// wait for top stories tab to close
		assertTrue(webDriver.waitForCss(By.id("topstories-header"), "display", "none"));
	}

	@When("^I click \"([^\"]*)\" tab at the foot of the page$")
	public void I_click_tab_at_the_foot_of_the_page(String arg1) throws Throwable {
		webDriver.click(webDriver.findElement(By.id("topstories-control-footer")));
	}

	@Then("^a list of the footer \"([^\"]*)\" opens$")
	public void a_list_of_the_footer_opens(String arg1) throws Throwable {
		assertEquals("block", webDriver.getElementCssValue(By.id("topstories-footer"), "display"));
	}

	@Then("^another click on the footer \"([^\"]*)\" closes the list.$")
	public void another_click_on_the_footer_closes_the_list(String arg1) throws Throwable {
		webDriver.click(webDriver.findElement(By.id("topstories-control-footer")));
		assertEquals("none", webDriver.getElementCssValue(By.id("topstories-footer"), "display"));
	}

	@When("^I select the sections navigation button$")
	public void I_select_the_sections_navigation_button( ) throws Throwable {
		webDriver.jsClick(webDriver.findElement(By.className("control--sections")));
	}

	@Then("^it should show me a list of sections$")
	public void it_should_show_a_list_of_sections() throws Throwable {
		assertEquals("block", webDriver.getElementCssValue(By.className("nav-popup-sections"), "display"));
	}

	@Then("^another click on the \"([^\"]*)\" \"([^\"]*)\" tab closes the list$")
	public void another_click_on_the_tab_closes_the_list(String arg1, String arg2) throws Throwable {
		webDriver.click(webDriver.findElement(By.id("sections-control-" + arg1)));
		assertEquals("none", webDriver.getElementCssValue(By.id("sections-" + arg1), "display"));
	}

	@Given("^I have a fast connection speed$")
	public void I_have_a_fast_connection_speed() throws Throwable {
		JavascriptExecutor js = (JavascriptExecutor) webDriver;
		js.executeScript("window.performance = {timing: {requestStart: 1, responseStart: 5000}};");
	}

	@Then("^the high resolution version of the image is displayed$")
	public void article_high_resolution_image_and_caption_is_displayed() throws Throwable {
		WebElement highResImage = webDriver.findElement(By.className("image-high"));
		assertTrue(highResImage != null);
	}


	@Then("^I can (expand|collapse) expanders$")
	public void I_can_expand_and_collapse_expanders(String sectionState) throws Throwable {
		// waits for expander to appear
		WebElement expander = webDriver.waitForElement(By.className("cta"));
		webDriver.jsClick(expander);
		
		String expectedTrailblockHeight = (sectionState.equals("expand")) ? "none" : "0";
		// sections are hidden with css max-height
		assertTrue(webDriver.waitForCss(By.cssSelector(".related-trails .panel"), "max-height", expectedTrailblockHeight));
	}

	@When("^Back to top is selected$")
	public void Back_to_top_is_selected() throws Throwable {

	}

	@Then("^page scrolls to the top$")
	public void article_page_scrolls_to_the_top() throws Throwable {
		//get href value of the element (back to the top) to locate for example "top" div is show above the container as a way for confirming the Back to the top will work
		String var = webDriver.findElement(By.linkText("Back to top")).getAttribute("href");
		assertTrue(webDriver.findElements(By.id(var.substring(var.indexOf("#")+1))).size() > 0);
	}

	@When("^I click footer links \\(Desktop version, Help, Contact us, Feedback, T&C's and Pricacy policy\\)$")
	public void I_click_footer_links_Desktop_version_Help_Contact_us_Feedback_T_C_s_and_Pricacy_policy() throws Throwable {

	}

	@Then("^the corresponding footer pages are displayed$")
	public void the_corresponding_footer_pages_are_displayed() throws Throwable {			
		//check all bottom of page links
		webDriver.selectCheckBottomOfPageLinks();
	}
	
	@Then("^the published date should be in '([^']*)'$")
	public void the_published_date_should_be_in(String timezone) throws Throwable {
		// get the dateline
		WebElement dateline = webDriver.findElement(By.cssSelector(".dateline time"));
		// make sure it has the correct timezone
		StringAssert.assertContains(timezone, dateline.getText());
	}
	
	@Then("^the published time should be '([^']*)'$")
	public void the_published_time_should_be(String time) throws Throwable {
		// get the dateline
		WebElement dateline = webDriver.findElement(By.cssSelector(".dateline time"));
		// make sure it has the correct timezone
		StringAssert.assertContains(time, dateline.getText());
	}
	
}

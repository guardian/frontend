package com.gu.test;

import cucumber.api.java.en.And;
import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;

import static org.junit.Assert.assertEquals;

public class DiscussionSteps {
    private final SharedDriver webDriver;

    public DiscussionSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

    protected String articlewithcomments = "/help/insideguardian/2012/feb/29/threaded-comments";
    List<WebElement> topLevelComments;


    @Given("^I am on an article with comments$")
    public void I_am_on_an_article() throws Throwable {
        webDriver.open(articlewithcomments);
    }


    @When("^I choose to view the comments$")
    public void I_choose_to_view_the_comments()  {
        WebElement commentlink=webDriver.findElement(By.cssSelector(" .d-commentcount"));
    webDriver.click(commentlink);
    webDriver.waitForElement(By.cssSelector(".d-discussion"));
    }

    @Then("^I can see (\\d+) top level comments$")
    public void I_can_see_top_level_comments(int parentcommentsshownbydefault)  {
        topLevelComments = webDriver.findElements(By.cssSelector(".d-comment--top-level"));
        assertEquals(topLevelComments.size(), parentcommentsshownbydefault);
    }

    @And("^the first comment is authored by \"([^\"]*)\"$")
    public void the_first_comment_is_authored_by(String author){
        assertEquals(webDriver.findElement(By.cssSelector(".d-comment__author")).getText(),"monkeyface");

    }


    @When("^I show more comments$")
    public void I_show_more_comments()  {

    webDriver.findElement(By.cssSelector(".js-show-more-comments")).click();
        (new WebDriverWait(webDriver, 10)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver d) {
                return d.findElements(By.cssSelector(".d-comment--top-level")).size() == topLevelComments.size()+10;
            }
        });
    }
}



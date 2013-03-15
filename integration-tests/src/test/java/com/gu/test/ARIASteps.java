package com.gu.test;

import cucumber.annotation.en.Then;
import org.openqa.selenium.By;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

public class ARIASteps {
    private final SharedDriver webDriver;

    public ARIASteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

    @Then("^\"([^\"]*)\" has a role of \"([^\"]*)\"$")
    public void tag_role(String tag, String role){
        assertThat(webDriver.findElement(By.tagName(tag)).getAttribute("role"),is(role));


         }
    @Then("^\"([^\"]*)\" has an aria-role of \"([^\"]*)\"$")
    public void tag_role_aria(String tag, String role){
        assertThat(webDriver.findElement(By.tagName(tag)).getAttribute("aria-role"),is(role));


    }

    @Then("^\"([^\"]*)\" has an aria-label of \"([^\"]*)\"$")
    public void tag_role_aria_label(String tag, String label){
        assertThat(webDriver.findElement(By.tagName(tag)).getAttribute("aria-label"),is(label));


    }
    @Then("^element with ID \"([^\"]*)\" has a role of \"([^\"]*)\"$")
    public void tag_role_aria_label_id(String id, String label){
        assertThat(webDriver.findElement(By.id(id)).getAttribute("role"),is(label));


    }
}

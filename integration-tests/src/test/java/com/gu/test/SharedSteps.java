package com.gu.test;

import java.util.List;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;

public class SharedSteps {

    private final SharedDriver webDriver;
    
    
    public SharedSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
    
	@Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {
//		//a guardian page
		webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims");
	}
	
}
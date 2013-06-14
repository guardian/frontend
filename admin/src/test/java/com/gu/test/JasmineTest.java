package com.gu.test;

import static org.junit.Assert.*;

import java.io.File;

import junit.framework.Assert;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class JasmineTest {

	private WebDriver driver;
	private String host;
	private StringBuffer verificationErrors = new StringBuffer();

	@Before
	public void setUp() throws Exception {
		driver = new FirefoxDriver();
		
		File dir1 = new File(".");

		//locate current directory and open the url from file 
		driver.get("file:///" + dir1.getCanonicalPath() + "/public/javascripts/spec/SpecRunner.html");	
		
		//check if are on the right page	
		assertTrue("Error in opening Jasmine runner", driver.getTitle().contains("Jasmine"));
	}

	@Test
	public void jasmineTest() throws Exception {
		if (driver.findElements(By.cssSelector("span.failingAlert.bar")).size() != 0) {
			System.out.println("==========================================================================================");
			System.out.println(driver.findElement(By.cssSelector("span.failingAlert.bar")).getText());
			System.out.println("==========================================================================================");
			System.out.println(driver.findElement(By.xpath("id('details')")).getText());
			System.out.println("==========================================================================================");
		}
	}

	@After
	public void tearDown() throws Exception {
		driver.quit();
		String verificationErrorString = verificationErrors.toString();
		if (!"".equals(verificationErrorString)) {
			fail(verificationErrorString);
		}
	}

}

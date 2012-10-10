package com.gu.test;

import java.util.NoSuchElementException;
import java.util.concurrent.TimeUnit;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;


public class FootballTestPage {

	static WebDriver driver;

	public FootballTestPage() {
		initialiseBrowser();
	}

	public WebDriver getDriver() {
		return driver;
	}
	public static void setDriver(WebDriver driver) {
		FootballTestPage.driver = driver;
	}

	private static void initialiseBrowser() {
		//teamcity box requires a proxy to run the host url
		if (System.getProperty("proxyname") != null) {
			FirefoxProfile profile = new FirefoxProfile();
			profile.setPreference("network.proxy.type", 1);
			profile.setPreference("network.proxy.http", System.getProperty("proxyname"));
			profile.setPreference("network.proxy.http_port", 3128);

			driver = new FirefoxDriver(profile);
			setDriver(driver);
		}
		else{
			driver = new FirefoxDriver();
			setDriver(driver);
		}
	}

	public void open(String url) {
		getDriver().get(url);
	}

	public void close() {
		getDriver().close();
	}

	public void deleteCookieNamed(String cookieName) {
		getDriver().manage().deleteCookieNamed(cookieName);
	}

	public boolean isElementPresent(By elementName){
		getDriver().manage().timeouts().implicitlyWait(2, TimeUnit.SECONDS);
		boolean exists=false;
		try{
			exists = getDriver().findElements(elementName).size() != 0;
		}catch(NoSuchElementException e){
		}

		getDriver().manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
		return exists;
	}

	public void clickButton(By buttonName) {
		getDriver().findElement(buttonName).click();
		getDriver().manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public boolean isTextPresent(String textToSearch) {
		return getDriver().findElement(By.tagName("body")).getText().contains(textToSearch);
	}

	public void waitForTextPresent(String textToSearch) {
		for (int second = 0;; second++) {
			if (second >= 30) {
				System.out.println("could not find " + textToSearch);
				break;
			}
			try { if (isTextPresent(textToSearch)) 
				break;
			} catch (Exception e) {}
			try {
				Thread.sleep(1000);
			} catch (Exception e) {}
		}
	}

	public void refresh() {
		getDriver().navigate().refresh();
	}

	public void waitForElementPresent(By elementName) {
		for (int second = 0;; second++) {
			if (second >= 30) {
				System.out.println("could not find element " + elementName);
				break;
			}
			try {
				if (isElementPresent(elementName))
					break;
			} catch (Exception e) {}
			try {
				Thread.sleep(1000);
			} catch (Exception e) {}
		}
	}

	public int getPageSource(String value) {
		return getDriver().getPageSource().indexOf(value);
	}

	public String getHost() {
		//defaults to localhost
		String host = "http://localhost:9000";

		if(System.getProperty("host") != null && !System.getProperty("host").isEmpty()) {
			host = System.getProperty("host");
		}
		return host;
	}
}
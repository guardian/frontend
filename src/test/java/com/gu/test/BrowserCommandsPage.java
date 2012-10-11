package com.gu.test;

import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.concurrent.TimeUnit;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;


public class BrowserCommandsPage {

	static WebDriver driver;

	public BrowserCommandsPage() {
		initialiseBrowser();
	}

	public WebDriver getDriver() {
		return driver;
	}
	public static void setDriver(WebDriver driver) {
		BrowserCommandsPage.driver = driver;
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

	public void clickLink(String linkName) {
		getDriver().findElement(By.linkText(linkName)).click();
		getDriver().manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public void clickButton(By buttonName) {
		getDriver().findElement(buttonName).click();
		getDriver().manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public boolean isTextPresent(String textToSearch) {
		return getDriver().findElement(By.tagName("body")).getText().contains(textToSearch);
	}


	public boolean isTextPresentByElement(By elementname, String textToSearch) {

		return getDriver().findElement(elementname).getText().contains(textToSearch);
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

	public void type(By elementName, String elementValue) {
		getDriver().findElement(elementName).clear();
		getDriver().findElement(elementName).sendKeys(elementValue);
	}

	public void submit(By elementName) {
		getDriver().findElement(elementName).submit();
	}

	public void refresh() {
		getDriver().navigate().refresh();
	}

	public void checkApproveButton() {
		if (isElementPresent(By.id("approve_button"))) {
			clickButton(By.id("approve_button"));	
			getDriver().manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
		}
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

	public void checkFormIsEmpty() {
		WebElement form = getDriver().findElement(By.id("network-front-tool"));
		// check each input element is empty
		for (WebElement textInput : form.findElements(By.cssSelector("input[type='text']"))) {
			Assert.assertEquals("", textInput.getText());
		}

	}

	public String getHost() {
		//defaults to localhost
		String host = "http://localhost:9000";

		if(System.getProperty("host") != null && !System.getProperty("host").isEmpty()) {
			host = System.getProperty("host");
		}
		return host;
	}

	public void click(By elemenName) {

		if (getDriver().findElements(elemenName).size() !=0) {
			getDriver().findElement(elemenName).click();
			waitFor(1000);
		}
		else
			System.out.println(elemenName + " the button does not exist or visible");
	}

	public void waitFor(int time) {
		try {
			Thread.sleep(time);
		} catch (InterruptedException e) {
			System.out.println("Interrupted Exception error " + e);
		}

	}

	public void closeAll(){
		//quits webdriver any open windows
		getDriver().quit();

		//kills all running firefox process
		Runtime rt = Runtime.getRuntime();
		if (System.getProperty("os.name").toLowerCase().indexOf("linux") > -1)
			try {
				rt.exec("killall -9 firefox");
				System.out.println("killing firefox");
			} catch (IOException e) {
				e.printStackTrace();
			}
	}
}
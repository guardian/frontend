package com.gu.test;

import cucumber.api.Scenario;
import cucumber.api.java.After;
import cucumber.api.java.Before;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import static org.junit.Assert.assertEquals;

public class SharedDriver extends EventFiringWebDriver {
	
	static final int WAIT_TIME = 5;
	
	protected static String HOST;

	protected static String USERPREFS;

	private static WebDriver REAL_DRIVER;

	private static final Thread CLOSE_THREAD = new Thread() {
		@Override
		public void run() {
			REAL_DRIVER.quit();
		}
	};

	static {

		// defaults to localhost
		HOST = (System.getProperty("host") != null && !System.getProperty("host").isEmpty())
			? System.getProperty("host") : "http://localhost:9000";
		
		USERPREFS = "#gu.prefs.switchOff=swipe-nav";

		// create driver
		REAL_DRIVER = DriverFactory.createDriver(System.getProperty("driver", "firefox"), System.getProperty("http_proxy", ""));

		Runtime.getRuntime().addShutdownHook(CLOSE_THREAD);
	}

	public SharedDriver() {
		super(REAL_DRIVER);
	}

	@Before
	public void initaliseDriver() {
		// delete cookies
		manage().deleteAllCookies();
		// clear local storage
		clearLocalStorage();
	}

    @After
    public void embedScreenshot(Scenario scenario) throws IOException {
        if (scenario.isFailed()) {
            System.out.println("URL on failure was: "+getCurrentUrl());
            try {
                byte[] screenshot = getScreenshotAs(OutputType.BYTES);
                new File("target/surefire-reports/").mkdirs(); // ensure directory is there
                FileOutputStream out = new FileOutputStream("target/surefire-reports/failure-screenhot-" + UUID.randomUUID().toString() + ".png");
                //write screenshot to file
                out.write(screenshot);
                out.close();
            } catch (WebDriverException somePlatformsDontSupportScreenshots) {
                System.err.println(somePlatformsDontSupportScreenshots.getMessage());
            }
        }
    }

	public void clearLocalStorage() {
		// only execute on a page
        if (!getCurrentUrl().equals("about:blank") && REAL_DRIVER instanceof FirefoxDriver) {
            //this doesn't work in Chrome (throws an exception see http://code.google.com/p/chromedriver/issues/detail?id=153)
		executeScript("window.localStorage.clear();");

		}
	}

	public void open(String url) {
		get(HOST + url + USERPREFS);
	}

	public boolean isTextPresentByElement(By elementname, String textToSearch) {
		return findElement(elementname).getText().toLowerCase()
				.contains(textToSearch.toLowerCase());
	}

	public String getElementCssValue(By elementName, String property) {
		return findElement(elementName).getCssValue(property);
	}

	/**
	 * Wait for an element to appear
	 * 
	 * @param locator
   * @return The element
	 */
	public WebElement waitForElement(By locator) {
	  return waitForElement(locator, WAIT_TIME);
	}
	
	/**
	 * Wait for an element to appear
	 * 
	 * @param locator
	 * @param waitTime
	 * @return The element
	 */
	public WebElement waitForElement(By locator, int waitTime) {
    return new WebDriverWait(this, waitTime)
      .until(ExpectedConditions.presenceOfElementLocated(locator));
	}

	/**
	 * Wait for an element to become visible
	 * 
	 * @param locator
	 */
	public WebElement waitForVisible(By locator) {
		return new WebDriverWait(this, WAIT_TIME)
			.until(ExpectedConditions.visibilityOfElementLocated(locator));
	}

	/**
	 * Wait for an element to become hidden
	 * 
	 * @param locator
	 */
	public boolean waitForHidden(By locator) {
		return new WebDriverWait(this, WAIT_TIME)
			.until(ExpectedConditions.invisibilityOfElementLocated(locator));
	}

	/**
	 * Wait for an element to have some text
	 * 
	 * @param locator 
	 * @param text
	 */
	public boolean waitForText(By locator, String text) {
		return new WebDriverWait(this, WAIT_TIME)
			.until(ExpectedConditions.textToBePresentInElement(locator, text));
	}

	/**
	 * Wait for an element's CSS property to have a particular value
	 * 
	 * @param locator The locator for the element 
	 * @param property The CSS property
	 * @param value The CSS property's value
	 */
	public boolean waitForCss(By locator, String property, String value) {
		return new WebDriverWait(this, WAIT_TIME)
			.until(WaitFor.cssToBe(locator, property, value));
	}

	public void selectCheckBottomOfPageLinks() throws IOException {
		// get all footer links
		List<WebElement> footerLinks = findElements(By.cssSelector("footer a"));

		for (WebElement footerLink : footerLinks) {
			// checks if the page is 200 - errors if it finds another type of page eg 404, 502
			assertEquals(200, checkURLReturns(footerLink.getAttribute("href")));
		}
	}

	public int checkURLReturns(String url) throws IOException {

		// returns response code
		URL server = new URL(url);
		Properties systemProperties = System.getProperties();
		if (System.getProperty("http_proxy") != null
				&& !System.getProperty("http_proxy").isEmpty()) {
			URL proxyUrl = new URL(System.getProperty("http_proxy"));
			systemProperties.setProperty("http.proxyHost", proxyUrl.getHost());
			// extract the port, or use the default
			int port = (proxyUrl.getPort() != -1) ? proxyUrl.getPort()
					: proxyUrl.getDefaultPort();
			systemProperties.setProperty("http.proxyPort", Integer.toString(port));
		}

		HttpURLConnection connection = (HttpURLConnection) server
				.openConnection();
		connection.setRequestMethod("GET");
		connection.connect();

		return connection.getResponseCode();
	}

	/**
	 * Fire a Javascript click on an element
	 * 
	 * @param element
	 */
	public void click(WebElement element) {
		 element.click();
	}

    public void jsClick(WebElement element) {
        ((JavascriptExecutor)this).executeScript("arguments[0].click();", element);
    }

}

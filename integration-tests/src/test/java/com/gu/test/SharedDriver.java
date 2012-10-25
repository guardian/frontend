package com.gu.test;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.NoSuchElementException;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import cucumber.annotation.Before;

import java.io.IOException;
import java.net.URLConnection; 


public class SharedDriver extends EventFiringWebDriver {

	private static final WebDriver REAL_DRIVER;

	protected EventListener eventListener;

	private static final Thread CLOSE_THREAD = new Thread() {
		@Override
		public void run() {
			REAL_DRIVER.close();
		}
	};

	static {
		FirefoxProfile profile = new FirefoxProfile();
		// if http_proxy system variable, set proxy in profile
		if (System.getProperty("http_proxy") != null && !System.getProperty("http_proxy").isEmpty()) {
			try {
				URL proxyUrl = new URL(System.getProperty("http_proxy"));
				profile.setPreference("network.proxy.type", 1);
				// set the proxy's url
				profile.setPreference("network.proxy.http", proxyUrl.getHost());
				// extract the port, or use the default
				int port = (proxyUrl.getPort() != -1) ? proxyUrl.getPort() : proxyUrl.getDefaultPort();
				profile.setPreference("network.proxy.http_port", port);
			} catch (MalformedURLException e) {
				System.out.println("Unable to parse `http_proxy`: " + e.getMessage());
			}
		}
		REAL_DRIVER = new FirefoxDriver(profile);

		Runtime.getRuntime().addShutdownHook(CLOSE_THREAD);
	}

	public SharedDriver() {
		super(REAL_DRIVER);

		// add an event listener to the driver
		eventListener = new EventListener();
		register(eventListener);
	}

	@Override
	public void close() {
		if(Thread.currentThread() != CLOSE_THREAD) {
			throw new UnsupportedOperationException("You shouldn't close this WebDriver. It's shared and will close when the JVM exits.");
		}
		super.close();
	}

	@Before
	public void initaliseDriver() {
		// delete cookies
		manage().deleteAllCookies();
		// clear local storage
		clearLocalStorag();
		// change size (iphone)
		//manage().window().setSize(new Dimension(320, 480));
	}

	public void deleteCookieNamed(String cookieName) {
		manage().deleteCookieNamed(cookieName);
	}

	public void clearLocalStorag() {
		executeScript("window.localStorage.clear();");
	}

	public void open(String url) {
		get(this.getHost() + url);
	}

	public String getHost() {
		//defaults to localhost
		String host = "http://localhost:9000";

		if (System.getProperty("host") != null && !System.getProperty("host").isEmpty()) {
			host = System.getProperty("host");
		}
		return host;
	}

	public boolean isElementPresent(By elementName){
		manage().timeouts().implicitlyWait(2, TimeUnit.SECONDS);
		boolean exists=false;
		try{
			exists = findElements(elementName).size() != 0;
		}catch(NoSuchElementException e){
		}

		manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
		return exists;
	}

	public void clickButton(By buttonName) {
		findElement(buttonName).click();
		manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public boolean isTextPresent(String textToSearch) {
		return findElement(By.tagName("body")).getText().contains(textToSearch);
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
		navigate().refresh();
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
		return getPageSource().indexOf(value);
	}

	public boolean isTextPresentByElement(By elementname, String textToSearch) {
		return findElement(elementname).getText().toLowerCase().contains(textToSearch.toLowerCase());
	}

	public void clickLink(String linkName) {
		findElement(By.linkText(linkName)).click();
		manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public void click(By elemenName) {

		if (findElements(elemenName).size() !=0) {
			findElement(elemenName).click();
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

	public String getelementCssValue(By elementName, String value) {
		return findElement(elementName).getCssValue(value);
	}

	/**
	 * Find an element, waiting for it to appear (5secs)
	 * 
	 * @param By locator 
	 * @return WebElement
	 */
	public WebElement findElementWait(By locator) {
		// wait for 5 secs
		WebDriverWait wait = new WebDriverWait(this, 5000);
		wait.until(ExpectedConditions.presenceOfElementLocated(locator));
		// return element
		return findElement(locator);
	}

	/**
	 * Wait for an element to become visible
	 * 
	 * @param By locator 
	 * @return booelan
	 */
	public boolean isVisibleWait(By locator) {
		// wait for 5 secs
		WebDriverWait wait = new WebDriverWait(this, 5000);
		wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
		return true;
	}

	public URLConnection getRawHttp(String url) {

		URL xurl = null;
		URLConnection urlc = null; 
		try{
			xurl = new URL(url);
		}catch(MalformedURLException mue){
			System.err.println(mue); 
		}
		try{
			urlc = xurl.openConnection();
			urlc.setRequestProperty("Accept-Encoding", "gzip");
		}catch(IOException ioe){
			System.err.println(ioe); 
		}
		return urlc;
	}  

	public String getproxyUrl() {
    	URL proxyUrl = null;
		try {
			proxyUrl = new URL(System.getProperty("host"));
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	return proxyUrl.getHost();
	}
	
}
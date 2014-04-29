package com.gu.test.actors;

import com.gu.test.actions.UIAction;
import hu.meza.aao.Action;
import hu.meza.aao.Actor;
import hu.meza.tools.HttpClientWrapper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.concurrent.TimeUnit;


public class Reader extends Actor {

	private HttpClientWrapper httpClient;
	private WebDriver driver;

	public Reader() {
		this(false);
	}

	public Reader(boolean needProxy) {
		if (needProxy) {
			String PROXY = "localhost:8080";

			org.openqa.selenium.Proxy proxy = new org.openqa.selenium.Proxy();
			proxy.setHttpProxy(PROXY).setFtpProxy(PROXY).setSslProxy(PROXY).setSocksProxy(PROXY);
			DesiredCapabilities cap = new DesiredCapabilities();
			cap.setCapability(CapabilityType.PROXY, proxy);
			driver = new FirefoxDriver(cap);
		} else {
			driver = new FirefoxDriver();
		}
		driver.manage().timeouts().implicitlyWait(100, TimeUnit.MILLISECONDS);
	}

	public void killBrowser() {
		if (driver != null) {
			driver.close();
			driver.quit();
		}
	}

	@Override
	public void execute(Action action) {

		if (action instanceof UIAction) {
			((UIAction) action).useDriver(driver);
		}


		super.execute(action);
	}

	public WebDriver driver() {

		return driver;
	}
}

package com.gu.test;

import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;

public class DriverFactory {
	
	public static WebDriver createDriver(String type, String httpProxy) {
		
		WebDriver driver;
		
		if (type.equals("htmlUnit")) {
			
			java.util.logging.Logger.getLogger("com.gargoylesoftware").setLevel(Level.OFF);
			DesiredCapabilities capabilities = DesiredCapabilities.firefox();
			capabilities.setJavascriptEnabled(true);
			
			driver = new HtmlUnitDriver(capabilities);
		}
        else if (type.equals("chrome")){
            if (!httpProxy.isEmpty()){
                Proxy proxy = new Proxy();
            proxy.setHttpProxy(httpProxy);
                DesiredCapabilities dc = DesiredCapabilities.chrome();
                dc.setCapability(CapabilityType.PROXY,proxy);
                driver = new ChromeDriver(dc);
            }
            else{
            driver = new ChromeDriver();
            }
            return driver;

        }
        else {

			FirefoxProfile profile = new FirefoxProfile();
			
			if (!httpProxy.isEmpty()) {
				try {
					URL proxyUrl = new URL(httpProxy);
					profile.setPreference("network.proxy.type", 1);
					// set the proxy's url
					profile.setPreference("network.proxy.http", proxyUrl.getHost());
					// extract the port, or use the default
					int port = (proxyUrl.getPort() != -1) ? proxyUrl.getPort() : proxyUrl.getDefaultPort();
					profile.setPreference("network.proxy.http_port", port);
				} catch (MalformedURLException e) {
					System.out.println("Unable to parse `httpProxy`: " + e.getMessage());
				}
			}

			driver = new FirefoxDriver(profile);
			
		}
		return driver;
		
	}
	
}
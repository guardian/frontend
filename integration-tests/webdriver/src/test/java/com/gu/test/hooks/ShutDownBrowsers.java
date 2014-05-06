package com.gu.test.hooks;

import com.gu.test.actors.Reader;
import com.gu.test.actors.Readers;
import cucumber.api.Scenario;
import cucumber.api.java.After;
import hu.meza.aao.Actor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

public class ShutDownBrowsers {

	private Readers readers;

	public ShutDownBrowsers(Readers readers) {
		this.readers = readers;
	}

	@After
	public void shutDownBrowsers(Scenario result) throws IOException {
		if (result.isFailed()) {
			WebDriver driver = ((Reader) readers.lastActor()).driver();
			takeScreenshot(result, (TakesScreenshot) driver);
		}

		for (Actor user : readers) {
			((Reader) user).killBrowser();
		}
	}

	private void takeScreenshot(Scenario result, TakesScreenshot driver) throws IOException {
		new File("target/failure-reports/").mkdirs(); // ensure directory is there
		byte[] myScreenshot = driver.getScreenshotAs(OutputType.BYTES);
		FileOutputStream out = new FileOutputStream(
			"target/failure-reports/screenshot-" + "failure-screenhot-" + randomNumber() + ".png");
		//...and write screenshot to cucumber report
		out.write(myScreenshot);
		result.embed(myScreenshot, "image/png");
		out.close();
	}

	private String randomNumber() {
		return UUID.randomUUID().toString();
	}

}

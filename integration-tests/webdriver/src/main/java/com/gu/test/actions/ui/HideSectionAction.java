package com.gu.test.actions.ui;


import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class HideSectionAction extends UIAction{

	private WebElement parent;

	public void execute() {
        WebDriver driver = driver();
        //this is not a mistake. The hide button has data link name Show.
		final WebElement toggle = driver.findElement(By.xpath("//button[@data-link-name = \"Show\"][1]"));

		parent = toggle.findElement(By.xpath("../.."));

		toggle.click();

	}

	public WebElement parent() {
		return parent;
	}

	@Override
	public HideSectionAction copyOf() {
		return new HideSectionAction();
	}
}

package com.gu.test.actions.ui;

import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;
import java.util.Random;


public class SelectArticleAction extends UIAction {

	private WebElement element;
	private String dataComponent;

	public SelectArticleAction(WebElement element) {
		this.element = element;
	}

	public SelectArticleAction() {
		this(null);
	}

	@Override
	public void execute() {
		if (element == null) {
			List<WebElement> elements = driver().findElements(By.xpath("//a[@data-link-name='article']"));
			do {
				Random r = new Random();
				int elementToChoose = r.nextInt(elements.size());
				element = elements.get(elementToChoose);
			} while (!element.isDisplayed());

		}
		dataComponent = element.findElement(By.xpath("ancestor::section[1]")).getAttribute("data-component");
		element.click();
		waitForPageLoaded(driver());
	}


	public String dataComponent() {
		return dataComponent;
	}


	@Override
	public SelectArticleAction copyOf() {
		return new SelectArticleAction(element);
	}

	private void waitForPageLoaded(WebDriver driver) {

		ExpectedCondition<Boolean> expectation = new ExpectedCondition<Boolean>() {
			public Boolean apply(WebDriver driver) {
				return ((JavascriptExecutor) driver).executeScript("return document.readyState")
													.equals("complete");
			}
		};

		Wait<WebDriver> wait = new WebDriverWait(driver, 30);
		try {
			wait.until(expectation);
		} catch (Throwable error) {
			throw new RuntimeException("Timeout waiting for Page Load Request to complete.");
		}
	}
}

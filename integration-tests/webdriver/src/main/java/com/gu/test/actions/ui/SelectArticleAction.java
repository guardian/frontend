package com.gu.test.actions.ui;

import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.Random;


public class SelectArticleAction extends UIAction {

	private WebElement element;

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
		element.click();
	}

	@Override
	public SelectArticleAction copyOf() {
		return new SelectArticleAction(element);
	}
}

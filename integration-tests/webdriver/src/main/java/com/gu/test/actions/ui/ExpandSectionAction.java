package com.gu.test.actions.ui;

import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.Random;

public class ExpandSectionAction extends UIAction {
    private String expandSectionSelector;
	private WebElement parent;


	public ExpandSectionAction() {
        this.expandSectionSelector = "button.collection__show-more";
    }


    @Override
    public void execute(){
        WebDriver driver = driver();
		List<WebElement> sections = driver.findElements(By.cssSelector(expandSectionSelector));
		final WebElement sectionExpand = randomSection(sections);
		this.parent = sectionExpand.findElement(By.xpath(".."));
		sectionExpand.click();

	}

	private WebElement randomSection(List<WebElement> sections) {
		Random r = new Random();
		int index = r.nextInt(sections.size());
		return sections.get(index);
	}

	public WebElement parent() {
		return parent;
	}

	@Override
	public ExpandSectionAction copyOf() {
		return new ExpandSectionAction();
	}
}

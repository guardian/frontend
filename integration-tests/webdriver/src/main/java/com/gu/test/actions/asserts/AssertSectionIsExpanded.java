package com.gu.test.actions.asserts;

import com.gu.test.actions.UIAction;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

public class AssertSectionIsExpanded extends UIAction {

	private final String message;
	private final WebElement section;
	private boolean success;

	public AssertSectionIsExpanded(WebElement section) {
		this("Section not expanded", section);
	}

	public AssertSectionIsExpanded(String message, WebElement section) {
		this.message = message;
		this.section = section;
	}


	@Override
	public void execute() {

		try {
			WebElement expandedList = section.findElement(By.cssSelector(".linkslist-container"));
			Assert.assertTrue(message, true);
		} catch (NoSuchElementException notFoundException) {
			Assert.fail(message);
		}

	}

	@Override
	public AssertSectionIsExpanded copyOf() {
		return new AssertSectionIsExpanded(section);
	}
}

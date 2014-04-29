package com.gu.test.actions.asserts;

import com.gu.test.actions.UIAction;
import org.junit.Assert;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

public class AssertSectionIsHidden extends UIAction {

	private final String message;
	private final WebElement section;

	public AssertSectionIsHidden(WebElement section) {
		this("Section not hidden", section);
	}

	public AssertSectionIsHidden(String message, WebElement section) {
		this.message = message;
		this.section = section;
	}


	@Override
	public void execute() {

		try {
			Assert.assertTrue(message, section.getAttribute("class").contains("container--rolled-up"));
		} catch (NoSuchElementException notFoundException) {
			Assert.fail(message);
		}

	}

	@Override
	public AssertSectionIsHidden copyOf() {
		return new AssertSectionIsHidden(section);
	}
}

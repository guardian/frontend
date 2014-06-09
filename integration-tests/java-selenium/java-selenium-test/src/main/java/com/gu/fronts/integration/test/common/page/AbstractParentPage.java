package com.gu.fronts.integration.test.common.page;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

/**
 * Super class for all page objects
 */
public class AbstractParentPage {

    protected WebDriver webDriver;

    public AbstractParentPage(WebDriver webDriver) {
        this.webDriver = webDriver;
    }

    /**
     * Check that all provided elements are displayed and if not will throw an AssertionError with a message detailing
     * which elements are not displayed.
     * 
     * @param elementsToCheck
     */
    public void isDisplayed(WebElement... elementsToCheck) {
        List<String> errors = new ArrayList<>();
        for (WebElement webElement : elementsToCheck) {
            checkElementAndCreateError(webElement, errors);
        }
        if (CollectionUtils.isNotEmpty(errors)) {
            throw new AssertionError("Page :" + this.getClass().getName() + " was not displayed properly due to: "
                    + getErrorMessages(errors));
        }
    }

    private String getErrorMessages(List<String> errors) {
        return StringUtils.join(errors, ",");
    }

    private void checkElementAndCreateError(WebElement webElement, List<String> errors) {
        try {
            webElement.isDisplayed();
        } catch (WebDriverException e) {
            errors.add(e.getMessage());
        }
    }

}

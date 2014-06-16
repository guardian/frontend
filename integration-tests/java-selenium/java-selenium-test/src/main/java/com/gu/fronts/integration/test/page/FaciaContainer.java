package com.gu.fronts.integration.test.page;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class FaciaContainer extends AbstractParentPage {

    private WebElement containerTopElement;

    public FaciaContainer(WebDriver webDriver, WebElement containerTopElement) {
        super(webDriver);
        this.containerTopElement = containerTopElement;
    }

    @Override
    public FaciaContainer isDisplayed() {
        assertExists(containerTopElement);
        return this;
    }
}

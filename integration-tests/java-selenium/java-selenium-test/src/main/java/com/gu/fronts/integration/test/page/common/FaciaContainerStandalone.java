package com.gu.fronts.integration.test.page.common;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class FaciaContainerStandalone extends AbstractParentPage {

    @FindByTestAttribute(using = "facia-standalone-container")
    private WebElement wrapperContainer;

    public FaciaContainerStandalone(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public Object isDisplayed() {
        assertExistsAndDisplayed(wrapperContainer);
        return this;
    }

}

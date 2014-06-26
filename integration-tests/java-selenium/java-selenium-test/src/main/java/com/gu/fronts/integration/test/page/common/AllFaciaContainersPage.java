package com.gu.fronts.integration.test.page.common;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class AllFaciaContainersPage extends AbstractParentPage {
    @FindByTestAttribute(using = "all-front-containers")
    private WebElement allFaciaContainers;

    public AllFaciaContainersPage(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public AllFaciaContainersPage isDisplayed() {
        assertExistsAndDisplayed(allFaciaContainers);
        return this;
    }

    public FaciaContainer containerWithId(String testAttributeId) {
        return pageFactory.initPage(webDriver, FaciaContainer.class, allFaciaContainers, testAttributeId);
    }
}

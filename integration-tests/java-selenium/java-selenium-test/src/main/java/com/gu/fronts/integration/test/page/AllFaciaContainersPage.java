package com.gu.fronts.integration.test.page;

import static org.openqa.selenium.By.cssSelector;

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
    protected AllFaciaContainersPage isDisplayed() {
        assertExists(allFaciaContainers);
        return this;
    }

    public void containerWithTestAttributeId(String testId) {
        // TODO fix the css selector
        allFaciaContainers.findElement(cssSelector("[a=b]"));
    }

}

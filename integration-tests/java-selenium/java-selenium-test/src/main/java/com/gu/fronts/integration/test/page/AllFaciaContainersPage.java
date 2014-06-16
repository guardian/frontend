package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.testAttributeCssSelector;
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

    public FaciaContainer containerWithTestAttributeId(String testId) {
        return new FaciaContainer(webDriver, findElementBy(allFaciaContainers,
                cssSelector(testAttributeCssSelector(testId))));
    }
}

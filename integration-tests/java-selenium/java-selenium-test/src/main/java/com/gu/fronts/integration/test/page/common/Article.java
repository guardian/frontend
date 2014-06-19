package com.gu.fronts.integration.test.page.common;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class Article extends AbstractParentPage {
    @FindByTestAttribute(using = "article")
    private WebElement rootElement;
    @FindByTestAttribute(using = "article-headline")
    private WebElement headline;

    public Article(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public Article isDisplayed() {
        assertExistsAndDisplayed(rootElement, headline);
        return this;
    }

    public String headlineText() {
        return headline.getText();
    }

}

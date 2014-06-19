package com.gu.fronts.integration.test.page.common;

import static com.gu.fronts.integration.test.page.util.PageElementHelper.getLinkFrom;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;
import com.gu.fronts.integration.test.page.util.CustomPageFactory;

/**
 * Due to the dynamic nature of facia containers, this page will not have the element initialized by the PageFactory but
 * rather it will have only the element provided in the constructor initialized. Build this artcle Page Object by first
 * finding the relative article using using the test attribute value {@link #ARTICLE_CONTAINER_ID} and then
 * {@link CustomPageFactory#initPage(WebDriver, Class, WebElement)} using the found WebElement
 */
public class FaciaArticle extends AbstractParentPage {

    private WebElement rootElement;
    public static final String ARTICLE_CONTAINER_ID = "article-container";

    public FaciaArticle(WebDriver webDriver, WebElement containerTopElement) {
        super(webDriver);
        this.rootElement = containerTopElement;
    }

    @Override
    public FaciaArticle isDisplayed() {
        assertExistsAndDisplayed(rootElement);
        return this;
    }

    public String headlineLinkText() {
        return getLinkFrom(rootElement).getText();
    }

    public Article clickHeadlineLink() {
        getLinkFrom(rootElement).click();
        return pageFactory.initPage(webDriver, Article.class);
    }

}

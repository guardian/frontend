package com.gu.fronts.integration.test.page.common;

import static com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute;
import static com.gu.fronts.integration.test.page.common.FaciaContainerArticle.ARTICLE_CONTAINER_ID;
import static com.gu.fronts.integration.test.page.util.PageElementHelper.waitUntilVisible;
import static org.openqa.selenium.By.cssSelector;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;
import com.gu.fronts.integration.test.page.util.CustomPageFactory;

/**
 * Due to the dynamic nature of facia containers, this page will not have the element initialized by the PageFactory but
 * rather it will have only the element provided in the constructor initialized. Build this Page Object using
 * {@link CustomPageFactory#initPage(WebDriver, Class, WebElement, String)}
 */
public class FaciaContainer extends AbstractParentPage {

    private WebElement rootElement;

    public FaciaContainer(WebDriver webDriver, WebElement containerTopElement) {
        super(webDriver);
        this.rootElement = containerTopElement;
    }

    /**
     * Gets the a container article element using the provided index. Observe that only those article sub elements with
     * test attribute value {@link FaciaContainerArticle#ARTICLE_CONTAINER_ID} will be retrieved
     */
    public FaciaContainerArticle articleAt(int index) {
        List<WebElement> containerElements = rootElement
                .findElements(cssSelector(byTestAttribute(ARTICLE_CONTAINER_ID)));
        return pageFactory.initPage(webDriver, FaciaContainerArticle.class, containerElements.get(index));
    }

    @Override
    public FaciaContainer isDisplayed() {
        assertExists(rootElement);
        return this;
    }

    public WebElement expand() {
        rootElement.findElement(cssSelector(byTestAttribute("show-more"))).click();
        WebElement expandedElement = waitUntilVisible(
                rootElement.findElement(cssSelector(byTestAttribute("show-more-news-expanded"))), 2, webDriver);
        return expandedElement;
    }

    public WebElement getRootElement() {
        return rootElement;
    }
}

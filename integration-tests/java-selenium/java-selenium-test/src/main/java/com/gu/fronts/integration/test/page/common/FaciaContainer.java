package com.gu.fronts.integration.test.page.common;

import static com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute;
import static com.gu.fronts.integration.test.page.common.FaciaArticle.ARTICLE_CONTAINER_ID;
import static com.gu.fronts.integration.test.page.common.FaciaGalleryItem.GALLERY_ITEM_CONTAINER_ID;
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

    private static final String SHOW_MORE_EXPANDED_ID = "show-more-news-expanded";
    private static final String SHOW_MORE_BUTTON_ID = "show-more";
    private WebElement rootElement;

    public FaciaContainer(WebDriver webDriver, WebElement containerTopElement) {
        super(webDriver);
        this.rootElement = containerTopElement;
    }

    /**
     * Gets the a container article element using the provided index. Observe that only those article sub elements with
     * test attribute value {@link FaciaArticle#ARTICLE_CONTAINER_ID} will be retrieved
     */
    public FaciaArticle articleAt(int index) {
        List<WebElement> containerElements = rootElement
                .findElements(cssSelector(byTestAttribute(ARTICLE_CONTAINER_ID)));
        return pageFactory.initPage(webDriver, FaciaArticle.class, containerElements.get(index));
    }

    @Override
    public FaciaContainer isDisplayed() {
        assertExistsAndDisplayed(rootElement);
        return this;
    }

    public WebElement expand() {
        rootElement.findElement(cssSelector(byTestAttribute(SHOW_MORE_BUTTON_ID))).click();
        WebElement expandedElement = waitUntilVisible(
                rootElement.findElement(cssSelector(byTestAttribute(SHOW_MORE_EXPANDED_ID))), 2, webDriver);
        return expandedElement;
    }

    public WebElement getRootElement() {
        return rootElement;
    }

    public FaciaGalleryItem galleryAt(int index) {
        List<WebElement> containerElements = rootElement
                .findElements(cssSelector(byTestAttribute(GALLERY_ITEM_CONTAINER_ID)));
        return pageFactory.initPage(webDriver, FaciaGalleryItem.class, containerElements.get(index));
    }
}

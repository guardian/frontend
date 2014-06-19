package com.gu.fronts.integration.test.page.common;

import static com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute;
import static com.gu.fronts.integration.test.page.util.PageElementHelper.findElementBy;
import static org.openqa.selenium.By.cssSelector;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class FaciaGalleryItem extends AbstractParentPage {
    public static final String GALLERY_ITEM_CONTAINER_ID = "gallery-item-container";
    private static final String GALLERY_PICTURE_ID = "gallery-picture";

    private WebElement rootElement;

    public FaciaGalleryItem(WebDriver webDriver, WebElement containerTopElement) {
        super(webDriver);
        this.rootElement = containerTopElement;
    }

    @Override
    public FaciaGalleryItem isDisplayed() {
        assertExistsAndDisplayed(rootElement);
        return this;
    }

    public GalleryOverlay clickPicture() {
        pictureElement().click();
        return pageFactory.initPage(webDriver, GalleryOverlay.class);
    }

    private WebElement pictureElement() {
        return findElementBy(rootElement, cssSelector(byTestAttribute(GALLERY_PICTURE_ID)));
    }

}

package com.gu.fronts.integration.test.page.common;

import static com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.TEST_ATTR_NAME;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class GalleryOverlay extends AbstractParentPage {

    private static final String GALLERY_IMAGE_ITEM_ID = "gallery-image-item";
    @FindByTestAttribute(using = "gallery-grid")
    private WebElement galleryGridButton;
    @FindByTestAttribute(using = "gallery-full")
    private WebElement galleryFullButton;
    @FindByTestAttribute(using = "gallery-next")
    private WebElement galleryNextButton;
    @FindByTestAttribute(using = GALLERY_IMAGE_ITEM_ID)
    private List<WebElement> galleryImages;
    @FindByTestAttribute(using = "close-overlay")
    private WebElement closeOverlayButton;

    public GalleryOverlay(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public GalleryOverlay isDisplayed() {
        assertExistsAndDisplayed(galleryGridButton);
        return this;
    }

    public GalleryOverlay clickGalleryGridMode() {
        assertExistsAndDisplayed(galleryGridButton);
        galleryGridButton.click();
        assertExistsAndDisplayed(galleryFullButton);
        return this;
    }

    public GalleryOverlay clickGalleryFullMode() {
        assertExistsAndDisplayed(galleryFullButton);
        galleryFullButton.click();
        assertExistsAndDisplayed(galleryGridButton);
        return this;
    }

    public GalleryOverlay clickNextGallery() {
        assertExistsAndDisplayed(galleryNextButton);
        galleryNextButton.click();
        return this;
    }

    /**
     * Only use this method when you are in full picture mode. Otherwise you would just get a random image
     */
    public WebElement getDisplayedImage() {
        WebElement displayedImage = null;
        for (WebElement image : galleryImages) {
            if (image.isDisplayed()) {
                displayedImage = image;
                break;
            }
        }
        if (displayedImage == null) {
            throw new RuntimeException("Could not find a displayed Gallery Overlay picture item with attribute ["
                    + TEST_ATTR_NAME + "=" + GALLERY_IMAGE_ITEM_ID);
        }
        return displayedImage;
    }

    public NetworkFrontPage close() {
        assertExistsAndDisplayed(closeOverlayButton);
        closeOverlayButton.click();
        return pageFactory.initPage(webDriver, NetworkFrontPage.class);
    }

}

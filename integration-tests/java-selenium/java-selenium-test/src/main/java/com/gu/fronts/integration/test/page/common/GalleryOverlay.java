package com.gu.fronts.integration.test.page.common;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class GalleryOverlay extends AbstractParentPage {

    @FindByTestAttribute(using = "gallery-grid")
    private WebElement galleryGridButton;
    @FindByTestAttribute(using = "gallery-full")
    private WebElement galleryFullButton;
    @FindByTestAttribute(using = "gallery-next")
    private WebElement galleryNextButton;
    @FindByTestAttribute(using = "gallery-image-item")
    private List<WebElement> galleryImages;

    public GalleryOverlay(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public GalleryOverlay isDisplayed() {
        assertExistsAndDisplayed(galleryGridButton);
        return this;
    }
    
    public GalleryOverlay clickGalleryGridMode(){
        assertExistsAndDisplayed(galleryGridButton);
        galleryGridButton.click();
        assertExistsAndDisplayed(galleryFullButton);
        return this;
    }
    
    public GalleryOverlay clickGalleryFullMode(){
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
            if(image.isDisplayed()){
                displayedImage = image;
                break;
            }
        }
        return displayedImage;
    }

}

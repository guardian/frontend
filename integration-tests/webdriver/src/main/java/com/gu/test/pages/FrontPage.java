package com.gu.test.pages;

import com.gu.test.helpers.WaitHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class FrontPage {
        private WebDriver driver;

        public FrontPage(WebDriver driver) {
                this.driver = driver;
        }

        public void expandContainer(String container) {
                String expandButton = ".container--" + container + " .collection__show-more";
                WebElement containerExpandButton = driver.findElement(By.cssSelector(expandButton));
                containerExpandButton.click();
        }

        public void hideContainer(String container) {
                String hideButton =
                        "//section[@data-component=\"" + container + "\"]//span[contains(text(), \"Hide\")]";
                WebElement containerHideButton = driver.findElement(By.xpath(hideButton));
                containerHideButton.click();
        }

        public void showContainer(String container) {
                String showButton =
                        "//section[@data-component=\"" + container + "\"]//span[contains(text(), \"Show\")]";

                WebElement containerHideButton = driver.findElement(By.xpath(showButton));
                containerHideButton.click();
        }

        public String currentStateOfShowHide(String container) {
                String buttonState = driver.findElement(By.xpath(
                        "//section[@data-component=\"" + container + "\"]//span[@class=\"container__toggle__text\"]"))
                        .getText();
                return buttonState;
        }

        public Article goToArticleInPeople() {
                return goToArticleInContainer("people");
        }

        public Article goToArticleInSportContainer() {
                return goToArticleInContainer("sport");
        }

        private Article goToArticleInContainer(String container) {
                driver.findElement(By.xpath("/descendant::section[@data-component=\"" + container
                        + "\"]//a[@data-link-name=\"article\"][1]")).click();
                WaitHelper.waitForPageLoad(driver);
                return new Article(driver);
        }

}

package com.gu.test.shared;

import com.gu.test.pages.FrontPage;
import com.gu.test.pages.SectionFront;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class NavigationBar {

    private WebDriver driver;
    public NavigationBar(WebDriver driver){
        this.driver = driver;
    }


    public FrontPage goToEdition(String edition) {
        driver.findElement(By.cssSelector("[data-link-name=\"switch to " + edition + " edition\"]")).click();
        return new FrontPage(driver);
    }

    private SectionFront goToSection(String section){
        driver.findElement(By.cssSelector("[data-link-name=\"/" + section + "\"]")).click();
        return new SectionFront(driver, section);
    }

    public SectionFront goToWorldNewsFront(){
        return goToSection("world");
    }

    public SectionFront goToUKSportFront(){
        return goToSection("uk/sport");
    }
    public SectionFront goToFootballFront(){
        return goToSection("football");
    }
    public SectionFront goToUKCommentFront(){
        return goToSection("uk/commentisfree");
    }

    public SectionFront goToUKCultureFront(){
        return goToSection("uk/culture");
    }

    public SectionFront goToLifeFront(){
        return goToSection("lifeandstyle");
    }




}

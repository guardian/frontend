package com.gu.test.actions.ui;


import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ShowSectionAction extends UIAction{


    public ShowSectionAction()
    {

    }


    public void execute() {
        WebDriver driver = driver();
        //this is not a mistake. The hide button has data link name Hide.
        driver.findElement(By.xpath("//button[@data-link-name = \"Hide\"][1]")).click();

    }

    @Override
    public <T> T copyOf() {
        return null;
    }
}

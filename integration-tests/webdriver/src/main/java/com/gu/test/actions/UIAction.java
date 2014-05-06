package com.gu.test.actions;

import hu.meza.aao.Action;
import org.openqa.selenium.WebDriver;

public abstract class UIAction implements Action{
    private WebDriver driver;


	public abstract void execute();

	public void useDriver(WebDriver driver)
    {
        this.driver = driver;
    }

    protected WebDriver driver() {
        return driver;
    }

}

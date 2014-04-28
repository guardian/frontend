package com.gu.test.actions.asserts;

import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

public class AssertElementsExistAction extends UIAction{

    private final List<By> locators;
    private boolean success;
    private List<String> elementsNotFound = new ArrayList<String>();


    public AssertElementsExistAction(List<By> locators){
        this.locators = locators;
    }

    public List<String> elementsNotFound(){
        return elementsNotFound;
    }

    public void execute(){
        WebDriver driver = driver();
        elementsNotFound = new ArrayList<String>();
        for (By locator: locators){
            try {
                driver.findElement(locator);
            }catch (NoSuchElementException e){
                elementsNotFound.add(locator.toString());

            }
        }
    }


    @Override
    public <T> T copyOf() {
        return null;
    }
}

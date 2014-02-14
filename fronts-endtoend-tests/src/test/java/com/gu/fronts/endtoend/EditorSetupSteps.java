package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.hooks.Configuration;
import cucumber.api.java.Before;
import cucumber.api.java.en.Given;
import hu.meza.tools.galib.GoogleAuthenticator;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class EditorSetupSteps {

    private final TrailBlockEditors editors;
    private Configuration config;

    public EditorSetupSteps(
            TrailBlockEditors editors, Configuration config
    ) {
        this.editors = editors;
        this.config = config;
    }

    @Before
    public void createAnEditor() {
//        editors.addActor("an editor", createEditor());
        isATrailBlockEditor("the editor");
    }

    @Given("^(.*) is a trailblock editor$")
    public void isATrailBlockEditor(String actorLabel) {
        editors.addActor(actorLabel, createEditor());
    }

    private TrailBlockEditor createEditor() {
        try {
            WebDriver driver = new FirefoxDriver();
            driver.get(config.baseUrl() + "/logout");

            driver.findElement(By.id("login-button")).click();
            driver.findElement(By.id("Email")).sendKeys(config.getUsename());
            driver.findElement(By.id("Passwd")).sendKeys(config.getPassword());
            driver.findElement(By.id("signIn")).click();


            GoogleAuthenticator ga = new GoogleAuthenticator(config.getGASecret());
            driver.findElement(By.id("smsUserPin")).sendKeys(ga.getCode());
            driver.findElement(By.id("smsVerifyPin")).click();
            TrailBlockEditor editor = new TrailBlockEditor(config.baseUrl(), driver.manage().getCookieNamed("PLAY_SESSION"));
            driver.close();
            return editor;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}

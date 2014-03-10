package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.hooks.Configuration;
import cucumber.api.java.Before;
import cucumber.api.java.en.Given;
import hu.meza.tools.galib.GoogleAuthenticator;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class EditorSetupSteps {

    private final TrailBlockEditors editors;
    private Configuration config;
    private static Cookie cookie;

    public EditorSetupSteps(
            TrailBlockEditors editors, Configuration config
    ) {
        this.editors = editors;
        this.config = config;
    }

    @Before
    public void createAnEditor() {
        TrailBlockEditor editor = createEditor();
        editors.addActor("the editor", editor);
        editors.addActor("an editor", editor);
    }

    @Given("^(.*) is a trailblock editor$")
    public void isATrailBlockEditor(String actorLabel) {
        editors.addActor(actorLabel, createEditor());
    }

    private TrailBlockEditor createEditor() {

        if (cookie != null) {
            return new TrailBlockEditor(config.baseUrl(), cookie);

        }

        int tries = 0;
        try {
            WebDriver driver = new FirefoxDriver();
            while (cookie == null) {
                if (tries > 3) {
                    throw new RuntimeException("Could not get user cookie");
                }
                driver.get(config.baseUrl() + "/logout");

                driver.findElement(By.id("login-button")).click();
                driver.findElement(By.id("Email")).sendKeys(config.getUsename());
                driver.findElement(By.id("Passwd")).sendKeys(config.getPassword());
                driver.findElement(By.id("signIn")).click();


                GoogleAuthenticator ga = new GoogleAuthenticator(config.getGASecret());
                driver.findElement(By.id("smsUserPin")).sendKeys(ga.getCode());
                driver.findElement(By.id("smsVerifyPin")).click();

                cookie = driver.manage().getCookieNamed("PLAY_SESSION");
                if (cookie != null) {
                    TrailBlockEditor editor = new TrailBlockEditor(config.baseUrl(), cookie);
                    driver.close();
                    return editor;
                }

                tries++;
            }
            throw new RuntimeException("Could not get user cookie");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}

package com.gu.test.actions.ui;

import com.gu.test.actions.UIAction;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class OpenPageUIAction extends UIAction {
	private final String baseUrl;
	private final String uri;

	public OpenPageUIAction(String baseUrl, String uri) {
		this.baseUrl = baseUrl;
		this.uri = uri;
	}

    @Override
    public void execute() {

        WebDriver driver = driver();
        driver.get(baseUrl + uri);

    }

    @Override
    public <T> T copyOf() {
        return null;
    }

}

package com.gu.test;

import com.gu.test.actions.ui.OpenPageUIAction;
import com.gu.test.actors.Reader;
import com.gu.test.actors.Readers;
import cucumber.api.java.Before;
import cucumber.api.java.en.Given;

public class UserSetup {

    private Readers readers;
    private Configuration config;
	private boolean needProxy;

	public UserSetup(Readers readers, Configuration config) {
        this.config = config;
        this.readers = readers;
    }

	@Before("@httpMock")
	public void needProxy() {
		needProxy = true;
	}

	@Given("^(.*) is a reader$")
    public Reader isAReader(String actorLabel) {
		Reader aReader = new Reader(needProxy);
		readers.addActor(actorLabel, aReader);
        return aReader;
    }

    @Given("^(.*) is viewing the front page$")
    public void isViewingTheFrontPage(String actorLabel) throws Throwable {
        Reader aReader = isAReader(actorLabel);
        OpenPageUIAction action = new OpenPageUIAction(config.baseUrl(),config.betaSite());
        aReader.execute(action);

    }

    @Given("^(.*) is viewing an article$")
    public void isViewingAnArticle(String actorLabel) throws Throwable {
        Reader aReader = isAReader(actorLabel);
        OpenPageUIAction action = new OpenPageUIAction(config.baseUrl(),config.betaSite());
        aReader.execute(action);

    }
}

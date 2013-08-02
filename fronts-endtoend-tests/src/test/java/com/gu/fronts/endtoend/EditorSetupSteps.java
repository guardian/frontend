package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.hooks.Configuration;
import cucumber.api.java.en.Given;

public class EditorSetupSteps {

	private final TrailBlockEditors editors;
	private Configuration config;

	public EditorSetupSteps(
		TrailBlockEditors editors, Configuration config
	) {
		this.editors = editors;
		this.config = config;
	}


	@Given("^(.*) is a trailblock editor$")
	public void isATrailBlockEditor(String actorLabel) {
		editors.addActor(actorLabel, new TrailBlockEditor(config.baseUrl()));
	}

}

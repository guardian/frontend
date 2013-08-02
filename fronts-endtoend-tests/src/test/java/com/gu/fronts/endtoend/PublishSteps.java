package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.PublishDraftAction;
import cucumber.api.java.en.And;
import hu.meza.aao.DefaultScenarioContext;

public class PublishSteps {

	private final TrailBlocks trailBlocks;
	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public PublishSteps(
		TrailBlocks trailBlocks, Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}


	@And("^([\\w]*) publishes the draft of ([\\w]*)$")
	public void publishesTheDraftOfTrailBlock(String actorLabel, String trailBlockLabel) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel);
		context.setSubject(trailBlock);

		TrailBlockEditor editor = editors.getActor(actorLabel);
		PublishDraftAction action = new PublishDraftAction(trailBlock);

		editor.execute(action);
	}
}

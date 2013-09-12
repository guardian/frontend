package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlockMode;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.AddStoryToTrailBlockAction;
import cucumber.api.java.en.When;
import hu.meza.aao.DefaultScenarioContext;

import java.util.UUID;

public class EditingSteps {

	private final TrailBlocks trailBlocks;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public EditingSteps(
		TrailBlocks trailBlocks, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.editors = editors;
		this.context = context;
	}

	@When("^(.*) edits the draft of ([\\w]*)$")
	public void editsTheDraftOfTrailBlock(String actorLabel, String trailBlockLabel) {
		editTrailBlock(actorLabel, trailBlockLabel, TrailBlockMode.DRAFT);

	}

	@When("^([\\w]*) edits the live ([\\w]*)$")
	public void editsTheLiveTrailBlock(String actorLabel, String trailBlockLabel) {
		editTrailBlock(actorLabel, trailBlockLabel, TrailBlockMode.LIVE);
	}

	private void editTrailBlock(String actorLabel, String trailBlockLabel, TrailBlockMode mode) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel, context);
		TrailBlockEditor editor = editors.getActor(actorLabel);

		Story story = new Story(UUID.randomUUID().toString());

		AddStoryToTrailBlockAction action = new AddStoryToTrailBlockAction(story, trailBlock, mode);
		editor.execute(action);
	}
}

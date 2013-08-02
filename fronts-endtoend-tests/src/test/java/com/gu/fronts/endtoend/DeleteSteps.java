package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.RemoveStoryFromTrailBlockAction;
import cucumber.api.java.en.When;
import hu.meza.aao.DefaultScenarioContext;

public class DeleteSteps {

	private final TrailBlocks trailBlocks;
	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public DeleteSteps(
		TrailBlocks trailBlocks, Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}

	@When("^(.*) deletes (.*) from (.*)$")
	public void deletesStoryFromTrailBlock(String actorLabel, String storyLabel, String trailBlockLabel) {
		TrailBlockEditor editor = (TrailBlockEditor) editors.getActor(actorLabel);

		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel);
		context.setSubject(trailBlock);

		Story story = stories.get(storyLabel);

		RemoveStoryFromTrailBlockAction action = new RemoveStoryFromTrailBlockAction(story, trailBlock);

		editor.execute(action);

	}

}

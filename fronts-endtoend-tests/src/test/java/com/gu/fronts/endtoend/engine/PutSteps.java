package com.gu.fronts.endtoend.engine;

import com.gu.fronts.endtoend.engine.actions.AddStoryToTrailBlockAction;
import cucumber.api.java.en.When;
import hu.meza.aao.Actor;
import hu.meza.aao.DefaultScenarioContext;
import org.junit.Assert;

public class PutSteps {

	private final TrailBlocks trailBlocks;
	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public PutSteps(
		TrailBlocks trailBlocks, Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}

	@When("^(.*) puts (.*) into (.*) to the position of (.*)$")
	public void putsStoryAIntoTrailBlockToThePositionOf(
		String actorLabel, String storyALabel, String trailBlockLabel, String storyBLabel
	) {
		TrailBlockEditor editor = (TrailBlockEditor) editors.getActor(actorLabel);

		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel);
		context.setSubject(trailBlock);

		Story storyA = stories.get(storyALabel);
		Story storyB = stories.get(storyBLabel);

		AddStoryToTrailBlockAction action = new AddStoryToTrailBlockAction(storyA, trailBlock, storyB);
		editor.execute(action);

		Assert.assertTrue(action.success());

	}

	@When("^(.*) is positioned below (.*)$")
	public void storyAIsPositionedBelowStoryB(String storyALabel, String storyBLabel) {
		TrailBlock trailBlock = context.getSubject();
		Actor lastActor = context.getLastActor();
		putsStoryAIntoTrailBlockToThePositionOf(lastActor.getLabel(), storyBLabel, trailBlock.getName(),
												storyALabel);
	}

}

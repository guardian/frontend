package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditor;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlockMode;
import com.gu.fronts.endtoend.engine.TrailBlocks;
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
		TrailBlockEditor editor = editors.getActor(actorLabel);

		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel, context);

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

	@When("^(.*) copies ([\\w]*) to ([\\w]*)$")
	public void copiesStoryAToTrailBlock(String actorLabel, String storyLabel, String trailBlockLabel) {
		addToTrailBlock(actorLabel, storyLabel, trailBlockLabel, TrailBlockMode.LIVE);

	}

	@When("^(.*) adds ([\\w]*) to the draft of ([\\w]*)$")
	public void addsStoryAToTrailBlockDraft(String actorLabel, String storyLabel, String trailBlockLabel) {
		addToTrailBlock(actorLabel, storyLabel, trailBlockLabel, TrailBlockMode.DRAFT);

	}

	@When("^([\\w]*) adds ([\\w]*) to ([\\w]*)$")
	public void addsStoryAToTrailBlock(String actorLabel, String storyLabel, String trailBlockLabel) {
		addToTrailBlock(actorLabel, storyLabel, trailBlockLabel, TrailBlockMode.LIVE);

	}

	private void addToTrailBlock(
		String actorLabel, String storyLabel, String trailBlockLabel, TrailBlockMode mode
	) {
		TrailBlockEditor editor = editors.getActor(actorLabel);

		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel, context);

		Story story = stories.get(storyLabel);

		AddStoryToTrailBlockAction action = new AddStoryToTrailBlockAction(story, trailBlock, mode);

		editor.execute(action);
	}
}

package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.AddStoryToTrailBlockAction;
import com.gu.fronts.endtoend.engine.actions.RemoveStoryFromTrailBlockAction;
import cucumber.api.java.en.Given;
import hu.meza.aao.DefaultScenarioContext;
import org.junit.Assert;

public class SetUpStoriesSteps {

	private final TrailBlocks trailBlocks;
	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public SetUpStoriesSteps(
		TrailBlocks trailBlocks, Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}

	@Given("^(.*) is part of (.*)$")
	public void storyIsPartOfTrailBlock(String storyLabel, String trailBlockLabel) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel, context);

		Story story = new Story(storyLabel);
		stories.add(story);

		AddStoryToTrailBlockAction action = new AddStoryToTrailBlockAction(story, trailBlock);

		editors.anyone().execute(action);

		Assert.assertTrue(action.success());
	}

	@Given("^(.*) is not part of (.*)$")
	public void storyIsNotPartOfTrailBlock(String storyLabel, String trailBlockLabel) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel, context);

		Story story = new Story(storyLabel);
		stories.add(story);

		RemoveStoryFromTrailBlockAction action = new RemoveStoryFromTrailBlockAction(story, trailBlock);

		editors.anyone().execute(action);

		Assert.assertTrue(action.success());

	}

}

package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.ViewTrailBlockAction;
import cucumber.api.java.en.Then;
import hu.meza.aao.DefaultScenarioContext;
import org.junit.Assert;

import java.util.List;

public class ContentAssertionSteps {

	private final TrailBlocks trailBlocks;
	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public ContentAssertionSteps(
		TrailBlocks trailBlocks, Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}

	@Then("^(.*) should not contain (.*)$")
	public void trailBlockShouldNotContainStory(String trailBlockLabel, String storyLabel) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel);
		context.setSubject(trailBlock);

		Story story = stories.get(storyLabel);

		ViewTrailBlockAction action = new ViewTrailBlockAction(trailBlock);

		editors.anyone().execute(action);

		List<String> returnedStories = action.liveStories();

		Assert.assertFalse(
			String.format("%s contains %s though it shouldn't", trailBlock.getName(), story.getName()),
			returnedStories.contains(story.getName()));
	}

}

package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.Story;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.actions.ViewTrailBlockAction;
import cucumber.api.java.en.Then;
import hu.meza.aao.DefaultScenarioContext;
import org.junit.Assert;

import java.util.List;

public class PositionAssertSteps {

	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public PositionAssertSteps(
		Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}

	@Then("^(.*) should be above (.*)$")
	public void storyAShouldBeAboveStoryB(String storyALabel, String storyBLabel) {
		TrailBlock trailBlock = context.getSubject();

		Story storyA = stories.get(storyALabel);
		Story storyB = stories.get(storyBLabel);

		ViewTrailBlockAction action = new ViewTrailBlockAction(trailBlock);

		editors.anyone().execute(action);

		List<String> returnedStories = action.liveStories();
		boolean isAbove =
			returnedStories.lastIndexOf(storyA.getName()) < returnedStories.lastIndexOf(storyB.getName());

		Assert.assertTrue(String.format("%s was not above %s", storyALabel, storyBLabel), isAbove);

	}

}

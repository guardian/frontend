package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlockMode;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.ViewTrailBlockAction;
import cucumber.api.java.en.Then;
import hu.meza.aao.DefaultScenarioContext;
import org.junit.Assert;

import java.util.ArrayList;
import java.util.List;

public class ContentAssertionSteps {

	private final TrailBlocks trailBlocks;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public ContentAssertionSteps(
		TrailBlocks trailBlocks, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.editors = editors;
		this.context = context;
	}

	@Then("^([\\w]*) draft should contain ([\\w]*)$")
	public void trailBlockDraftShouldContainStory(String trailBlockLabel, String storyLabel) {
		assertContentPresentIn(trailBlockLabel, storyLabel, TrailBlockMode.DRAFT);

	}

	@Then("^([\\w]*) should contain ([\\w]*)$")
	public void trailBlockShouldContainStory(String trailBlockLabel, String storyLabel) {
		assertContentPresentIn(trailBlockLabel, storyLabel, TrailBlockMode.LIVE);
	}

	@Then("^([\\w]*) draft should not contain ([\\w]*)$")
	public void trailBlockDraftShouldNotContainStory(String trailBlockLabel, String storyLabel) {
		assertContentNotPresentIn(trailBlockLabel, storyLabel, TrailBlockMode.DRAFT);

	}

	@Then("^([\\w]*) should not contain ([\\w]*)$")
	public void trailBlockShouldNotContainStory(String trailBlockLabel, String storyLabel) {
		assertContentNotPresentIn(trailBlockLabel, storyLabel, TrailBlockMode.LIVE);
	}

	@Then("^the draft version of ([\\w]*) should be replaced by the live version$")
	public void theDraftVersionOfTrailBlockShouldBeReplacedByTheLiveVersion(String trailBlockLabel) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel);
		context.setSubject(trailBlock);

		ViewTrailBlockAction action = new ViewTrailBlockAction(trailBlock);

		editors.anyone().execute(action);

		Assert.assertArrayEquals(action.liveStories().toArray(), action.draftStories().toArray());
	}

	@Then("^the live version of ([\\w]*) should be replaced by the draft$")
	public void theLiveVersionShouldBeReplacedByTheDraft(String trailBlockLabel) {
		theDraftVersionOfTrailBlockShouldBeReplacedByTheLiveVersion(trailBlockLabel);
	}

	private void assertContentNotPresentIn(String trailBlockLabel, String storyLabel, TrailBlockMode mode) {
		List<String> returnedStories = getContent(trailBlockLabel, mode);

		Assert.assertFalse(
			String.format("%s %s contains %s though it shouldn't", mode, trailBlockLabel, storyLabel),
			returnedStories.contains(storyLabel));
	}

	private void assertContentPresentIn(String trailBlockLabel, String storyLabel, TrailBlockMode mode) {
		List<String> returnedStories = getContent(trailBlockLabel, mode);


		Assert.assertTrue(
			String.format("%s %s does not contain %s though it should", mode, trailBlockLabel, storyLabel),
			returnedStories.contains(storyLabel));
	}

	private List<String> getContent(String trailBlockLabel, TrailBlockMode mode) {
		TrailBlock trailBlock = trailBlocks.get(trailBlockLabel, context);

		ViewTrailBlockAction action = new ViewTrailBlockAction(trailBlock);

		editors.anyone().execute(action);

		List<String> returnedStories = new ArrayList<>();
		switch (mode) {
			case DRAFT:
				returnedStories = action.draftStories();
				break;
			case LIVE:
				returnedStories = action.liveStories();
				break;
		}
		return returnedStories;
	}

}

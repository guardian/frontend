package com.gu.fronts.endtoend;

import com.gu.fronts.endtoend.engine.Stories;
import com.gu.fronts.endtoend.engine.TrailBlock;
import com.gu.fronts.endtoend.engine.TrailBlockEditors;
import com.gu.fronts.endtoend.engine.TrailBlocks;
import com.gu.fronts.endtoend.engine.actions.TrailBlockCreateAction;
import cucumber.api.java.en.Given;
import hu.meza.aao.DefaultScenarioContext;
import org.junit.Assert;

public class TrailBlockSetupSteps {

	private final TrailBlocks trailBlocks;
	private final Stories stories;
	private final TrailBlockEditors editors;
	private final DefaultScenarioContext context;

	public TrailBlockSetupSteps(
		TrailBlocks trailBlocks, Stories stories, TrailBlockEditors editors, DefaultScenarioContext context
	) {
		this.trailBlocks = trailBlocks;
		this.stories = stories;
		this.editors = editors;
		this.context = context;
	}


	@Given("^(.*) is an existing trailblock$")
	public void isAnExistingTrailBlock(String trailBlockName) {

		TrailBlock trailBlock = new TrailBlock(trailBlockName);
		context.setSubject(trailBlock);

		TrailBlockCreateAction trailBlockCreateAction = new TrailBlockCreateAction(trailBlock);

		editors.anyone().execute(trailBlockCreateAction);

		if (!trailBlockCreateAction.success()) {
			Assert.fail("Failed to create trail block");
		}

		trailBlocks.add(trailBlock);

	}

}

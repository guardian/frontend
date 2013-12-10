package com.gu.fronts.endtoend.hooks;

import cucumber.api.java.Before;
import hu.meza.aao.DefaultScenarioContext;

public class ContextHooks {

	private final DefaultScenarioContext context;

	public ContextHooks(DefaultScenarioContext context) {
		this.context = context;
	}

	@Before
	public void clearContext() {
		context.clean();
	}

}

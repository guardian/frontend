package com.gu.fronts.endtoend.hooks;

import hu.meza.tools.config.Config;
import hu.meza.tools.config.OptionalConfigurationFile;
import hu.meza.tools.config.RequiredConfigurationFile;
import hu.meza.tools.config.SystemPropertiesConfiguration;

public class Configuration {

	private final Config config;

	public Configuration(Config config) {
		this.config = config;
		config.add(new RequiredConfigurationFile("environment.properties"));
		config.addOverriding(new OptionalConfigurationFile("developer.properties"));
		config.addHighOrder(new SystemPropertiesConfiguration());
	}

	public String baseUrl() {
		return config.get("baseUrl");
	}
}

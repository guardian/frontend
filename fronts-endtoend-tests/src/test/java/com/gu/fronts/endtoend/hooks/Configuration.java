package com.gu.fronts.endtoend.hooks;

import hu.meza.tools.config.Config;
import hu.meza.tools.config.OptionalConfigurationFile;
import hu.meza.tools.config.RequiredConfigurationFile;
import hu.meza.tools.config.SystemPropertiesConfiguration;

import java.io.File;

public class Configuration {

	private final Config config;

	public Configuration(Config config) {
		this.config = config;

		final SystemPropertiesConfiguration systemPropertiesConfiguration =
			new SystemPropertiesConfiguration();

		Config system = new Config();
		system.add(systemPropertiesConfiguration);

		String userHome = system.get("user.home");
		String path = String.format("%s%s.gu%sfrontend.properties", userHome, File.separator,
									File.separator);
		system = null;

		File frontendConfig = new File(path);
		config.add(new OptionalConfigurationFile(frontendConfig));
		config.addOverriding(new RequiredConfigurationFile("environment.properties"));
		config.addOverriding(new OptionalConfigurationFile("developer.properties"));
		config.addHighOrder(systemPropertiesConfiguration);
	}

	public String baseUrl() {
		return config.get("baseUrl");
	}

	public String cookieString() {
		return config.get("userCookie");
	}
}

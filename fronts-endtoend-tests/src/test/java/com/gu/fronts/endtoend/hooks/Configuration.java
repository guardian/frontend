package com.gu.fronts.endtoend.hooks;

import hu.meza.tools.config.Config;
import hu.meza.tools.config.Loaders.FileConfiguration;
import hu.meza.tools.config.Loaders.ResourceConfiguration;
import hu.meza.tools.config.Loaders.SystemPropertiesConfiguration;
import hu.meza.tools.config.Optional;
import hu.meza.tools.config.Required;

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

		File frontendConfigFile = new File(path);
		config.add(new Optional(new FileConfiguration(frontendConfigFile)));
		config.addOverriding(new Required(new ResourceConfiguration("environment.properties")));
		config.addOverriding(new Optional(new ResourceConfiguration("developer.properties")));
		config.addHighOrder(systemPropertiesConfiguration);
	}

	public String baseUrl() {
		return config.get("baseUrl");
	}

	public String cookieString() {
		return config.get("userCookie");
	}
}

package com.gu.fronts.integration.test;

import static com.gu.fronts.integration.test.EnvironmentConfigurer.ENVIRONMENT_KEY;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

@Configuration
@ComponentScan({ "com.gu.fronts.integration" })
@PropertySource(value = { "classpath:${" + ENVIRONMENT_KEY + "}-config.properties" })
@ImportResource("classpath:spring-app-context.xml")
public class SpringTestConfig {

    @Bean(destroyMethod="quit")
    public WebDriver getWebdriver() {
        return new FirefoxDriver();
    }

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

}

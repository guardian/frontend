package com.gu.test;

import org.junit.runner.RunWith;

import cucumber.junit.Cucumber;

@RunWith(Cucumber.class)
@Cucumber.Options(tags = "~@ignore", format = {"pretty", "html:target/cucumber-html-report"})

public class RunCukesTest {
	
}
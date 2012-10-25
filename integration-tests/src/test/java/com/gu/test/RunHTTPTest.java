package com.gu.test;

import cucumber.junit.Cucumber;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@Cucumber.Options(tags = "~@ignore", format = {"pretty", "html:target/cucumber-html-report"})

public class RunHTTPTest {
}
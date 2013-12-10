package com.gu.test;

import cucumber.api.junit.Cucumber;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@Cucumber.Options(tags = "@frontendadmintest", format = {"progress", "html:target/cucumber-html-report"})
public class RunFeatureTest {

}
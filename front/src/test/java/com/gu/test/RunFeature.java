package com.gu.test;

import cucumber.junit.Cucumber;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@Cucumber.Options(tags = "~@ignore", format = "html:target/cukes")

public class RunFeature {
}
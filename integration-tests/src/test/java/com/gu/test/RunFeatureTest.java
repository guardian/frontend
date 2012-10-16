package com.gu.test;

import cucumber.junit.Cucumber;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@Cucumber.Options(tags = "@network-front", format = "html:target/cukes")

public class RunFeatureTest {
}
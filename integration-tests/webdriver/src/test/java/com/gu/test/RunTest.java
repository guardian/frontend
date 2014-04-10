package com.gu.test;

import cucumber.api.SnippetType;
import cucumber.api.junit.Cucumber;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@Cucumber.Options(tags = "~@ignore", snippets = SnippetType.CAMELCASE)
public class RunTest {
}

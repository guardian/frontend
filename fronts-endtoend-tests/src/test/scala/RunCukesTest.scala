package com.gu.fronts.endtoend

import org.junit.runner.RunWith
import cucumber.api.junit.Cucumber
import cucumber.api.{CucumberOptions, SnippetType}

@RunWith(classOf[Cucumber])
@CucumberOptions(tags = Array("~@ignore"), snippets = SnippetType.CAMELCASE)
class RunCukesTest

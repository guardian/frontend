package com.gu.integration.test.features.util

import com.gu.integration.test.SeleniumTestSuite

trait IntegrationSeleniumTestSuite extends SeleniumTestSuite {
  //this is needed because of the sbt multimodule nature of this test project
  //without it, it will try to load the local.conf from the root folder
  System.setProperty("local.conf.loc", s"${sys.props.get("user.dir").getOrElse("")}/scala-fw-tests/local.conf")
}

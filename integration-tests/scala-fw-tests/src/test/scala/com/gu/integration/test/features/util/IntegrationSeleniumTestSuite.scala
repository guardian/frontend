package com.gu.integration.test.features.util


import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.util.FileUtil._

trait IntegrationSeleniumTestSuite extends SeleniumTestSuite {
  //only used because of the need to have a static init block, which the companion object below acts as
}

object IntegrationSeleniumTestSuite{
  //this is needed because of the sbt multimodule nature of this test project
  //without it, it will try to load the local.conf from the root folder
  System.setProperty("local.conf.loc", s"${currentPath()}/scala-fw-tests/local.conf")
}

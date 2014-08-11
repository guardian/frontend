package com.gu.integration.test.features.util


import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.util.FileUtil._
import com.gu.integration.test.util.PropertyUtil._

trait IntegrationSeleniumTestSuite extends SeleniumTestSuite {
  //only used because of the need to have a static init block, which the companion object below acts as
  IntegrationSeleniumTestSuite
}

object IntegrationSeleniumTestSuite {
  //this is needed because of the sbt multimodule nature of this test project
  //without it, it will try to load the local.conf from the root folder
  setLocalConfProperty(s"${currentPath()}/frontend-tests/local.conf")
}

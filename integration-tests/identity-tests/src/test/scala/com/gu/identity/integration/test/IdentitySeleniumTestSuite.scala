package com.gu.identity.integration.test

import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.util.FileUtil._
import com.gu.integration.test.util.PropertyUtil._

trait IdentitySeleniumTestSuite extends SeleniumTestSuite {
  //only used because of the need to have a static init block, which the companion object below acts as
  IdentitySeleniumTestSuite
}

object IdentitySeleniumTestSuite {
  //this is needed because of the sbt multimodule nature of this test project
  //without it, it will try to load the local.conf from the root folder
  setLocalConfProperty(s"${currentPath()}/identity-tests/local.conf")
}


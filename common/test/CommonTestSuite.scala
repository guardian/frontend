package test

import conf.CachedHealthCheckTest
import navigation.NavigationTest
import org.scalatest.Suites

class CommonTestSuite extends Suites(
  new CachedHealthCheckTest,
  new NavigationTest
) with SingleServerSuite {
  override lazy val port: Int = 19016
}


package test

import conf.CachedHealthCheckTest
import conf.audio.FlagshipEmailContainerSpec
import navigation.NavigationTest
import org.scalatest.Suites

class CommonTestSuite extends Suites(
  new CachedHealthCheckTest,
  new NavigationTest,
  new FlagshipEmailContainerSpec
) with SingleServerSuite {
  override lazy val port: Int = 19016
}


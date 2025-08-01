package test

import ab.ABTestsTest
import conf.CachedHealthCheckTest
import conf.audio.FlagshipFrontContainerSpec
import navigation.NavigationTest
import org.scalatest.Suites
import renderers.DotcomRenderingServiceTest

class CommonTestSuite
    extends Suites(
      new ABTestsTest,
      new CachedHealthCheckTest,
      new NavigationTest,
      new FlagshipFrontContainerSpec,
      new DotcomRenderingServiceTest,
    )
    with SingleServerSuite {}

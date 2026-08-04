package test

import ab.{ABTestsTest, PuzzlesHubExperimentTest}
import conf.CachedHealthCheckTest
import conf.audio.FlagshipFrontContainerSpec
import http.ABTestingFilterTest
import navigation.NavigationTest
import org.scalatest.Suites
import renderers.DotcomRenderingServiceTest

class CommonTestSuite
    extends Suites(
      new ABTestsTest,
      new PuzzlesHubExperimentTest,
      new ABTestingFilterTest,
      new CachedHealthCheckTest,
      new NavigationTest,
      new FlagshipFrontContainerSpec,
      new DotcomRenderingServiceTest,
    )
    with SingleServerSuite {}

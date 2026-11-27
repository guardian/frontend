package test

import ab.{ABTestsTest, PuzzlesHubV3ExperimentTest, PuzzlesHubV4ExperimentTest}
import conf.CachedHealthCheckTest
import conf.audio.FlagshipFrontContainerSpec
import http.ABTestingFilterTest
import navigation.NavigationTest
import model.dotcomrendering.DotcomPuzzlesPageRenderingDataModelTest
import org.scalatest.Suites
import renderers.DotcomRenderingServiceTest

class CommonTestSuite
    extends Suites(
      new ABTestsTest,
      new PuzzlesHubV3ExperimentTest,
      new PuzzlesHubV4ExperimentTest,
      new ABTestingFilterTest,
      new CachedHealthCheckTest,
      new NavigationTest,
      new DotcomPuzzlesPageRenderingDataModelTest,
      new FlagshipFrontContainerSpec,
      new DotcomRenderingServiceTest,
    )
    with SingleServerSuite {}

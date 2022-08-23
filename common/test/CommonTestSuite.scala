
package test

import conf.CachedHealthCheckTest
import conf.audio.FlagshipFrontContainerSpec
import navigation.NavigationTest
import org.scalatest.Suites
import renderers.DotcomRenderingServiceTest
import agents.PopularInTagAgentTest

class CommonTestSuite
    extends Suites(
      new CachedHealthCheckTest,
      new NavigationTest,
      new FlagshipFrontContainerSpec,
      new DotcomRenderingServiceTest,
    )
    with SingleServerSuite {}

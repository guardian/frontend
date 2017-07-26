package test

import conf.CachedHealthCheckTest
import org.scalatest.Suites
import rendering.core.RenderingActorTest

class CommonTestSuite extends Suites (
  new CachedHealthCheckTest,
  new RenderingActorTest
) with SingleServerSuite {
  override lazy val port: Int = 19016
}


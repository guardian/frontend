package test

import conf.CachedHealthCheckTest
import org.scalatest.Suites

class CommonTestSuite extends Suites (
  new CachedHealthCheckTest
) with SingleServerSuite {
  override lazy val port: Int = 19016
}


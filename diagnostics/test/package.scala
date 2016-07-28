package test

import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}

class DiagnosticsTestSuite extends Suites (
  // Add you test classes here
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}

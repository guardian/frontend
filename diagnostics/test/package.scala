package test

import controllers.HealthCheck
import org.scalatest.Suites

class DiagnosticsTestSuite extends Suites (
  // Add you test classes here
) with SingleServerSuite {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}

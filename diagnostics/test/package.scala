package test

import org.scalatest.Suites

class DiagnosticsTestSuite extends Suites (
  new services.DiagnosticsHealthcheckTest
  ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}

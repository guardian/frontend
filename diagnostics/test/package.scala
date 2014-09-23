package test

import org.scalatest.Suites

class DiagnosticsTestSuite extends Suites (
  new diagnostics.JavaScriptTest,
  new services.DiagnosticsHealthcheckTest
  ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}

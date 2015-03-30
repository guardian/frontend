package test

import org.scalatest.Suites

class FaciaToolTestSuite extends Suites (
  new config.TransformationsSpec,
  new services.FaciaToolHealthcheckTest,
  new util.EnumeratorsTest,
  new util.RichFutureTest,
  new util.SanitizeInputTest,
  new tools.FaciaApiTest) with SingleServerSuite {

  override lazy val port: Int = controllers.HealthCheck.testPort
}

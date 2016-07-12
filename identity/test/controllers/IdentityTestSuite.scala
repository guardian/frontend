package controllers

import org.scalatest.Suites
import test.SingleServerSuite

class IdentityTestSuite extends Suites(
  new EditProfileControllerTest,
  new EmailControllerTest,
  new SignoutControllerTest
) with SingleServerSuite {
  override lazy val port: Int = new HealthCheck().testPort
}

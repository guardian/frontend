package controllers

import org.scalatest.{BeforeAndAfterAll, Suites}
import test.{SingleServerSuite, WithTestWsClient}

class IdentityTestSuite extends Suites(
  new EditProfileControllerTest,
  new EmailControllerTest,
  new SignoutControllerTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {
  override lazy val port: Int = new HealthCheck(wsClient).testPort
}

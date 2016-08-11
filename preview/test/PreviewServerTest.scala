package test

import org.scalatest._

class PreviewTestSuite extends Suites (
  new PreviewServerTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new controllers.HealthCheck(wsClient).testPort
}

@DoNotDiscover class PreviewServerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  // These features are tested elsewhere, this is actually just here to ensure that the
  // preview server can start up and serve a page

  "Preview Server" should "be able to serve an article" in goTo("/technology/2014/may/18/de-rosa-idol-bicycle-review-martin-love") { browser =>
    browser.$("body").getText should include ("Debating the pros and cons of each of these materials is the kind of thing that keeps passionate cyclists awake at night")
  }
}

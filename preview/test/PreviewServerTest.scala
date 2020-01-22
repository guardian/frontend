package test

import org.scalatest._

class PreviewTestSuite extends Suites (
  new PreviewServerTest
) with SingleServerSuite {
  override lazy val port: Int = 19012
}

@DoNotDiscover class PreviewServerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  // These features are tested elsewhere, this is actually just here to ensure that the
  // preview server can start up and serve a page

  "Preview Server" should "be able to serve an article" in goTo("/news/2017/nov/16/a-mission-for-journalism-in-a-time-of-crisis") { browser =>
    browser.$("body").text should include ("Now we are living through another extraordinary period in history")
  }
}

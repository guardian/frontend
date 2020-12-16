package test

import org.scalatest._

class PreviewTestSuite
    extends Suites(
      new PreviewServerTest,
    )
    with SingleServerSuite {
  override lazy val port: Int = 19012
}

@DoNotDiscover class PreviewServerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  // These features are tested elsewhere, this is actually just here to ensure that the
  // preview server can start up and serve a page

  "Preview Server" should "be able to serve an article" in goTo(
    "/business/2020/oct/07/tesco-hit-by-533m-covid-costs-but-sales-jump-during-pandemic",
  ) { browser =>
    browser.$("body").text should include("The UK’s biggest retailer reported")
  }
}

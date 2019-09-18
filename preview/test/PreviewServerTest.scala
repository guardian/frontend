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

  "Preview Server" should "be able to serve an article" in goTo("/music/2015/jan/01/music-awards-for-new-artists-blessing-or-curse") { browser =>
    browser.$("body").text should include ("The annual next-big-thing lists are now such a stepping-stone that a nomination is a major aim of many artist-development campaigns")
  }
}

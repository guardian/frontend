package test

import controllers.LiveBlogController
import experiments.{ActiveExperiments, LiveblogFiltering}
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class LiveBlogControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val liveBlogUrl = "global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"

  lazy val liveBlogController = new LiveBlogController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient,
  )

  it should "return the latest blocks of a live blog" in {
    val lastUpdateBlock = "block-56d03169e4b074a9f6b35baa"
    val fakeRequest = FakeRequest(
      GET,
      s"/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live.json?lastUpdate=$lastUpdateBlock",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      "/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live",
      Some(lastUpdateBlock),
      None,
      Some(true),
      filterKeyEvents = None,
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks
    content should include("block-56d03968e4b0bd5a0524cbae")
    content should include("block-56d039fce4b0d38537b1f61e")
    content should not include "56d04877e4b0bd5a0524cbe2" // at the moment it only tries 5 either way, reverse this test once we use blocks:published-since

    //this blockLiveBlogCurrentPageTest.scala
    content should not include lastUpdateBlock

    //older block
    content should not include "block-56d02bd2e4b0d38537b1f5fa"

  }

  it should "return only the key event blocks of a live blog, when switch is on" in {
    val fakeRequest = FakeRequest(
      GET,
      s"/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live.json",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      "/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live",
      lastUpdate = None,
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = Some(true),
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks

    if (ActiveExperiments.isParticipating(LiveblogFiltering)(fakeRequest)) {
      content should not include "56d084d0e4b0bd5a0524ccbe" // at the moment it only tries 5 either way, reverse this test once we use blocks:published-since
    }

  }

}

package test

import controllers.LiveBlogController
import org.mockito.Mockito._
import org.mockito.Matchers.{any, anyObject, anyString}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatestplus.mockito.MockitoSugar
import model.{LiveBlogPage, TopMentionsResult, TopMentionsTopic, TopMentionsTopicType, TopicsLiveBlog}
import topmentions.{TopMentionsS3Client, TopMentionsService}

import scala.concurrent.Future

@DoNotDiscover class LiveBlogControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with MockitoSugar {

  val liveBlogUrl = "global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"
  val path = "/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live"

  trait Setup {
    var fakeTopMentionsService = mock[TopMentionsService]
    var fakeDcr = new DCRFake()
    val topMentionResult = TopMentionsResult(
      name = "Fifa",
      `type` = TopMentionsTopicType.Org,
      blocks = Seq("56d08042e4b0d38537b1f70b"),
      count = 1,
      percentage_blocks = 1.2f,
    )
    when(
      fakeTopMentionsService.getTopMentionsByTopic(path, TopMentionsTopic(TopMentionsTopicType.Org, "Fifa")),
    ) thenReturn Some(
      topMentionResult,
    )
    lazy val liveBlogController = new LiveBlogController(
      testContentApiClient,
      play.api.test.Helpers.stubControllerComponents(),
      wsClient,
      fakeDcr,
      fakeTopMentionsService,
    )
  }

  it should "return the latest blocks of a live blog" in new Setup {
    val lastUpdateBlock = "block-56d03169e4b074a9f6b35baa"
    val fakeRequest = FakeRequest(
      GET,
      s"${path}.json?lastUpdate=$lastUpdateBlock",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path,
      page = None,
      lastUpdate = Some(lastUpdateBlock),
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = None,
      topics = None,
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

  "renderJson" should "return the latest blocks of a live blog using DCR" in new Setup {
    val lastUpdateBlock = "block-56d03169e4b074a9f6b35baa"
    val fakeRequest = FakeRequest(
      GET,
      s"${path}.json?lastUpdate=$lastUpdateBlock&dcr=true",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path,
      page = None,
      lastUpdate = Some(lastUpdateBlock),
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = None,
      topics = None,
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks
    content should include("FakeRemoteRender has found you out if you rely on this markup!")
  }

  it should "return the full CAPI response if DCR is true but lastUpdate is empty" in new Setup {
    val fakeRequest = FakeRequest(
      GET,
      s"${path}.json?dcr=true",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path,
      page = None,
      lastUpdate = None,
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = None,
      topics = None,
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should include("\"webTitle\"")
    content should include("\"headline\"")
    content should not include ("FakeRemoteRender has found you out if you rely on this markup!")
  }

  it should "return only the key event blocks of a live blog, when switch is on" in new Setup {
    val fakeRequest = FakeRequest(
      GET,
      s"${path}.json",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path,
      page = None,
      lastUpdate = None,
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = Some(true),
      topics = None,
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should not include "56d084d0e4b0bd5a0524ccbe"
  }

  it should "return only the key event and summary blocks of a live blog, when switch is on" in new Setup {
    val fakeRequest = FakeRequest(
      GET,
      s"/world/live/2022/jan/17/covid-news-live-new-zealand-begins-vaccinating-children-aged-5-11-french-parliament-approves-vaccine-pass.json",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path =
        "/world/live/2022/jan/17/covid-news-live-new-zealand-begins-vaccinating-children-aged-5-11-french-parliament-approves-vaccine-pass",
      page = None,
      lastUpdate = None,
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = Some(true),
      topics = None,
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should not include "61e611b28f0856426bba2624"
    content should include("61e5b40e8f0856426bba21ea") // summary
    content should include("61e5fa058f0856426bba251f") // key event
  }

  it should "return only the topic filtered blocks that have recently updated" in new Setup {
    val lastUpdateBlock = "block-56d07f80e4b0d38537b1f708"
    val fakeRequest = FakeRequest(GET, s"${path}.json?isLivePage=true&dcr=true").withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path,
      page = None,
      lastUpdate = Some(lastUpdateBlock),
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = Some(false),
      topics = Some("org:Fifa"),
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // DCR is called for getting the html part of the response
    // where we get new blocks from capi response
    fakeDcr.updatedBlocks.length should be(1)
    fakeDcr.updatedBlocks(0).id should be("56d08042e4b0d38537b1f70b")

    // This is for the none html part
    // where we get new blocks from page result
    content should include("56d08042e4b0d38537b1f70b")
  }

  it should "return the requested page for DCR" in new Setup {
    val fakeRequest = FakeRequest(
      GET,
      s"${path}.json?dcr=true&page=with:block-56d071d2e4b0bd5a0524cc66",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderJson(
      path,
      page = Some("with:block-56d071d2e4b0bd5a0524cc66"),
      lastUpdate = None,
      rendered = None,
      isLivePage = Some(true),
      filterKeyEvents = Some(false),
      topics = None,
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should include("56d071d2e4b0bd5a0524cc66")
  }

  it should "use dcr if no dcr param is passed" in {
    val forceDCROff = false

    val shouldRemoteRender = !forceDCROff

    shouldRemoteRender should be(true)
  }

  it should "use DCR if the parameter dcr=true is passed" in new Setup {
    val forceDCROff = false

    val shouldRemoteRender = !forceDCROff
    shouldRemoteRender should be(true)
  }

  it should "use frontend if the parameter dcr=false is passed" in new Setup {
    val forceDCROff = true

    val shouldRemoteRender = !forceDCROff

    shouldRemoteRender should be(false)
  }

  it should "filter when the filter parameter is true" in new Setup {
    liveBlogController.shouldFilter(Some(true)) should be(true)
  }

  it should "not filter when the filter parameter is false" in new Setup {
    liveBlogController.shouldFilter(Some(false)) should be(false)
  }

  it should "not filter when the filter parameter is not provided" in new Setup {
    liveBlogController.shouldFilter(None) should be(false)
  }

  "getTopMentionsForFilters" should "returns none given no automatic filter query parameter" in new Setup {
    liveBlogController.getTopMentions(path, None) should be(None)
  }

  "getTopMentionsForFilters" should "returns none given an incorrect automatic filter query parameter" in new Setup {
    liveBlogController.getTopMentions(path, Some("orgFifa")) should be(None)
  }

  "getTopMentionsForFilters" should "returns correct topMentionResult given a correct automatic filter query parameter" in new Setup {
    liveBlogController.getTopMentions(path, Some("org:Fifa")) should be(Some(topMentionResult))
  }

  "renderArticle" should "returns the first page of filtered blog by topics" in new Setup {
    val fakeRequest = FakeRequest(
      GET,
      s"${path}",
    ).withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderArticle(
      path,
      page = None,
      filterKeyEvents = Some(false),
      topics = Some("org:Fifa"),
    )(fakeRequest)

    status(result) should be(200)
    assertDcrCalledForLiveBlogWithBlocks(fakeDcr, expectedBlocks = Seq("56d08042e4b0d38537b1f70b"))
  }

  "renderArticle" should "doesn't call getTopMentionsByTopic given filterKeyEvents and topics query params are provided" in new Setup {
    val fakeRequest = FakeRequest(GET, s"${path}").withHeaders("host" -> "localhost:9000")

    val result = liveBlogController.renderArticle(
      path,
      page = None,
      filterKeyEvents = Some(true),
      topics = Some("org:Fifa"),
    )(fakeRequest)

    verify(fakeTopMentionsService, times(0)).getTopMentionsByTopic(anyString(), anyObject())
    status(result) should be(200)
  }

  private def assertDcrCalledForLiveBlogWithBlocks(fakeDcr: DCRFake, expectedBlocks: Seq[String]) = {
    val liveblog = fakeDcr.requestedBlogs.dequeue()

    liveblog match {
      case LiveBlogPage(_, currentPage, _, _) => {
        currentPage.currentPage.blocks.map(_.id) should be(expectedBlocks)
      }
      case _ => fail("DCR was not called with a LiveBlogPage")
    }
  }
}

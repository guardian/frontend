package test

import controllers.LiveBlogController
import org.mockito.Mockito._
import org.mockito.Matchers.any
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatestplus.mockito.MockitoSugar
import model.{TopMentionsResult, TopMentionsTopic, TopMentionsTopicType}
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

  val fakeTopMentionsService = mock[TopMentionsService]
  val topMentionResult = TopMentionsResult(
    name = "nhs",
    `type` = TopMentionsTopicType.Org,
    blocks = Seq("blockId1"),
    count = 1,
    percentage_blocks = 1.2f,
  )
  when(
    fakeTopMentionsService.getTopMentionsByTopic(path, TopMentionsTopic(TopMentionsTopicType.Org, "nhs")),
  ) thenReturn Some(
    topMentionResult,
  )

  lazy val liveBlogController = new LiveBlogController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient,
    new DCRFake(),
    fakeTopMentionsService,
  )

  it should "return the latest blocks of a live blog" in {
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

  it should "return the latest blocks of a live blog using DCR" in {
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
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks
    content should include("FakeRemoteRender has found you out if you rely on this markup!")
  }

  it should "return the full CAPI response if DCR is true but lastUpdate is empty" in {
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
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should include("\"webTitle\"")
    content should include("\"headline\"")
    content should not include ("FakeRemoteRender has found you out if you rely on this markup!")
  }

  it should "return only the key event blocks of a live blog, when switch is on" in {
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
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should not include "56d084d0e4b0bd5a0524ccbe"
  }

  it should "return only the key event and summary blocks of a live blog, when switch is on" in {
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
    )(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    content should not include "61e611b28f0856426bba2624"
    content should include("61e5b40e8f0856426bba21ea") // summary
    content should include("61e5fa058f0856426bba251f") // key event
  }

  it should "return the requested page for DCR" in {
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

  it should "use DCR if the parameter dcr=true is passed" in {
    val forceDCROff = false

    val shouldRemoteRender = !forceDCROff
    shouldRemoteRender should be(true)
  }

  it should "use frontend if the parameter dcr=false is passed" in {
    val forceDCROff = true

    val shouldRemoteRender = !forceDCROff

    shouldRemoteRender should be(false)
  }

  it should "filter when the filter parameter is true" in {
    liveBlogController.shouldFilter(Some(true)) should be(true)
  }

  it should "not filter when the filter parameter is false" in {
    liveBlogController.shouldFilter(Some(false)) should be(false)
  }

  it should "not filter when the filter parameter is not provided" in {
    liveBlogController.shouldFilter(None) should be(false)
  }

  "getTopMentionsForFilters" should "return none given no automatic filter query parameter" in {
    liveBlogController.getTopMentionsByTopics(path, None) should be(None)
  }

  "getTopMentionsForFilters" should "return none given an incorrect automatic filter query parameter" in {
    liveBlogController.getTopMentionsByTopics(path, Some("orgnhs")) should be(None)
  }

  "getTopMentionsForFilters" should "return correct topMentionResult given a correct automatic filter query parameter" in {
    liveBlogController.getTopMentionsByTopics(path, Some("org:nhs")) should be(Some(topMentionResult))
  }
}

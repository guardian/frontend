package topmentions

import model.{TopMentionsDetails, TopMentionsResult, TopMentionsTopic, TopMentionsTopicType, TopicWithCount}
import org.scalatest.{BeforeAndAfterAll}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test.WithTestExecutionContext
import org.mockito.Mockito._
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

class TopMentionsServiceTest
    extends AnyFlatSpec
    with Matchers
    with BeforeAndAfterAll
    with WithTestExecutionContext
    with MockitoSugar {

  val fakeClient = mock[TopMentionsS3Client]
  val topMentionResult =
    TopMentionsResult(
      name = "name1",
      `type` = TopMentionsTopicType.Org,
      blocks = Seq("blockId1"),
      count = 1,
      percentage_blocks = 1.2f,
    )

  val topMentionResults = Seq(
    TopMentionsResult(
      name = "name1",
      `type` = TopMentionsTopicType.Org,
      blocks = Seq("blockId1"),
      count = 1,
      percentage_blocks = 1.2f,
    ),
    TopMentionsResult(
      name = "name2",
      `type` = TopMentionsTopicType.Person,
      blocks = Seq("blockId1"),
      count = 10,
      percentage_blocks = 1.2f,
    ),
  )
  val successResponse =
    TopMentionsDetails(entity_types = Seq(TopMentionsTopicType.Org), results = Seq(topMentionResult), model = "model")

  val successMultiResponse =
    TopMentionsDetails(entity_types = Seq(TopMentionsTopicType.Org), results = topMentionResults, model = "model")

  "refreshTopMentions" should "return successful future given getListOfKeys s3 call fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.failed(new Throwable(""))
    val topMentionService = new TopicService(fakeClient)

    Await.result(topMentionService.refreshTopics(), 1.second)
    val results = topMentionService.getAllTopMentions

    results should be(None)
  }

  "refreshTopMentions" should "return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1", "key2"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    when(fakeClient.getObject("key2")) thenReturn Future.failed(new Throwable("error happend"))

    val topMentionService = new TopicService(fakeClient)

    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)
    val results = topMentionService.getAllTopMentions

    refreshJob shouldBe a[Unit]
    results should be(None)
  }

  "refreshTopMentions" should "update in memory top mentions and return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)

    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)
    val results = topMentionService.getAllTopMentions

    refreshJob shouldBe a[Unit]
    results.isDefined should be(true)
    results.get.get("key1") should equal(Some(successResponse))
  }

  "getTopMentionsByTopic" should "return the correct top mention result given correct blog id, filter entity and filter value" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)

    val result = topMentionService.getTopMentionsByTopic("key1", TopMentionsTopic(TopMentionsTopicType.Org, "name1"))

    result.get should equal(topMentionResult)
  }

  "getTopMentionsByTopic" should "return none given correct blog id, filter entity and with same filter value but different case" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)

    val result = topMentionService.getTopMentionsByTopic("key1", TopMentionsTopic(TopMentionsTopicType.Org, "NAME1"))

    result should equal(None)
  }

  "getTopMentionsByTopic" should "return none given a blog id that doesn't exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)

    val result = topMentionService.getTopMentionsByTopic("key2", TopMentionsTopic(TopMentionsTopicType.Org, "name1"))

    result should equal(None)
  }

  "getTopMentionsByTopic" should "return none given a filter entity type that doesn't exist in cache for the relevant blog" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)

    val result = topMentionService.getTopMentionsByTopic("key1", TopMentionsTopic(TopMentionsTopicType.Person, "Boris"))

    result should equal(None)
  }

  "getTopMentionsByTopic" should "return none given a filter entity value that doesn't exist in cache for the relevant blog" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)

    val result =
      topMentionService.getTopMentionsByTopic("key1", TopMentionsTopic(TopMentionsTopicType.Org, "someRandomOrg"))

    result should equal(None)
  }

  "getTopics" should "return a list of topics given a blog id" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successMultiResponse)
    val expectedTopics =
      Some(
        List(
          TopicWithCount(TopMentionsTopicType.Org, "name1", 1),
          TopicWithCount(TopMentionsTopicType.Person, "name2", 10),
        ),
      )

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopics(), 1.second)
    val topicList =
      topMentionService.getTopics("key1")

    topicList should equal(expectedTopics)
  }

  "getTopics" should "return none given a blog id that doesn't exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successMultiResponse)
    val topMentionService = new TopicService(fakeClient)

    val topicList =
      topMentionService.getTopics("key1")

    topicList should equal(None)
  }
}

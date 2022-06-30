package topics

import model.{TopicsApiResponse, TopicResult, Topic, TopicType}
import org.scalatest.{BeforeAndAfterAll}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test.WithTestExecutionContext
import org.mockito.Mockito._
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

class TopicServiceTest
    extends AnyFlatSpec
    with Matchers
    with BeforeAndAfterAll
    with WithTestExecutionContext
    with MockitoSugar {

  val fakeClient = mock[TopicS3Client]
  val topicResult =
    TopicResult(
      name = "name1",
      `type` = TopicType.Org,
      blocks = Seq("blockId1"),
      count = 1,
      percentage_blocks = 1.2f,
    )

  val topicResults = Seq(
    TopicResult(
      name = "name1",
      `type` = TopicType.Org,
      blocks = Seq("blockId1"),
      count = 1,
      percentage_blocks = 1.2f,
    ),
    TopicResult(
      name = "name2",
      `type` = TopicType.Person,
      blocks = Seq("blockId1"),
      count = 10,
      percentage_blocks = 1.2f,
    ),
  )
  val successResponse =
    TopicsApiResponse(entity_types = Seq(TopicType.Org), results = Seq(topicResult), model = "model")

  val successMultiResponse =
    TopicsApiResponse(entity_types = Seq(TopicType.Org), results = topicResults, model = "model")

  "refreshTopics" should "return successful future given getListOfKeys s3 call fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.failed(new Throwable(""))
    val topicService = new TopicService(fakeClient)

    Await.result(topicService.refreshTopics(), 1.second)
    val results = topicService.getAllTopics

    results should be(None)
  }

  "refreshTopics" should "return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1", "key2"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    when(fakeClient.getObject("key2")) thenReturn Future.failed(new Throwable("error happend"))

    val topicService = new TopicService(fakeClient)

    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)
    val results = topicService.getAllTopics

    refreshJob shouldBe a[Unit]
    results should be(None)
  }

  "refreshTopics" should "update in memory topics and return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topicService = new TopicService(fakeClient)

    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)
    val results = topicService.getAllTopics

    refreshJob shouldBe a[Unit]
    results.isDefined should be(true)
    results.get.get("key1") should equal(Some(successResponse))
  }

  "getSelectedTopic" should "return the correct topic result given correct blog id, filter entity and filter value" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topicService = new TopicService(fakeClient)
    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)

    val result = topicService.getSelectedTopic("key1", Topic(TopicType.Org, "name1"))

    result.get should equal(topicResult)
  }

  "getSelectedTopic" should "return none given correct blog id, filter entity and with same filter value but different case" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topicService = new TopicService(fakeClient)
    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)

    val result = topicService.getSelectedTopic("key1", Topic(TopicType.Org, "NAME1"))

    result should equal(None)
  }

  "getSelectedTopic" should "return none given a blog id that doesn't exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topicService = new TopicService(fakeClient)
    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)

    val result = topicService.getSelectedTopic("key2", Topic(TopicType.Org, "name1"))

    result should equal(None)
  }

  "getSelectedTopic" should "return none given a filter entity type that doesn't exist in cache for the relevant blog" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topicService = new TopicService(fakeClient)
    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)

    val result =
      topicService.getSelectedTopic("key1", Topic(TopicType.Person, "Boris"))

    result should equal(None)
  }

  "getSelectedTopic" should "return none given a filter entity value that doesn't exist in cache for the relevant blog" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topicService = new TopicService(fakeClient)
    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)

    val result =
      topicService.getSelectedTopic("key1", Topic(TopicType.Org, "someRandomOrg"))

    result should equal(None)
  }

  "getAvailableTopics" should "return a list of available topics given a blog id" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successMultiResponse)
    val expectedTopics =
      Some(
        List(
          Topic(TopicType.Org, "name1", Some(1)),
          Topic(TopicType.Person, "name2", Some(10)),
        ),
      )

    val topicService = new TopicService(fakeClient)
    val refreshJob = Await.result(topicService.refreshTopics(), 1.second)
    val topicList =
      topicService.getAvailableTopics("key1")

    topicList should equal(expectedTopics)
  }

  "getAvailableTopics" should "return none given a blog id that doesn't exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successMultiResponse)
    val topicService = new TopicService(fakeClient)

    val topicList =
      topicService.getAvailableTopics("key1")

    topicList should equal(None)
  }
}

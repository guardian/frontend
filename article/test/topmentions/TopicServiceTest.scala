package topmentions

import com.gu.contentapi.client.model.ContentApiError
import com.gu.contentapi.client.model.v1.ItemResponse
import model.{TopicsDetails, TopicResult, Topic, TopicType}
import model.TopicType.TopicType
import org.scalatest.{BeforeAndAfterAll, GivenWhenThen}
import org.scalatest.featurespec.AnyFeatureSpec
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
  val topMentionResult =
    TopicResult(
      name = "name1",
      `type` = TopicType.Org,
      blocks = Seq("blockId1"),
      count = 1,
      percentage_blocks = 1.2f,
    )
  val successResponse =
    TopicsDetails(entity_types = Seq(TopicType.Org), results = Seq(topMentionResult), model = "model")

  "refreshTopMentions" should "return successful future given getListOfKeys s3 call fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.failed(new Throwable(""))
    val topMentionService = new TopicService(fakeClient)

    Await.result(topMentionService.refreshTopicsDetails(), 1.second)
    val results = topMentionService.getAllTopicsDetails

    results should be(None)
  }

  "refreshTopMentions" should "return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1", "key2"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    when(fakeClient.getObject("key2")) thenReturn Future.failed(new Throwable("error happend"))

    val topMentionService = new TopicService(fakeClient)

    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)
    val results = topMentionService.getAllTopicsDetails

    refreshJob shouldBe a[Unit]
    results should be(None)
  }

  "refreshTopMentions" should "update in memory top mentions and return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)

    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)
    val results = topMentionService.getAllTopicsDetails

    refreshJob shouldBe a[Unit]
    results.isDefined should be(true)
    results.get.get("key1") should equal(Some(successResponse))
  }

  "getTopMentionsByTopic" should "return the correct top mention result given correct blog id, filter entity and filter value" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)

    val result = topMentionService.getTopicResult("key1", Topic(TopicType.Org, "name1"))

    result.get should equal(topMentionResult)
  }

  "getTopMentionsByTopic" should "return none given correct blog id, filter entity and with same filter value but different case" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)

    val result = topMentionService.getTopicResult("key1", Topic(TopicType.Org, "NAME1"))

    result should equal(None)
  }

  "getTopMentionsByTopic" should "return none given a blog id that doesn't exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)

    val result = topMentionService.getTopicResult("key2", Topic(TopicType.Org, "name1"))

    result should equal(None)
  }

  "getTopMentionsByTopic" should "return none given a filter entity type that doesn't exist in cache for the relevant blog" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)

    val result = topMentionService.getTopicResult("key1", Topic(TopicType.Person, "Boris"))

    result should equal(None)
  }

  "getTopMentionsByTopic" should "return none given a filter entity value that doesn't exist in cache for the relevant blog" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopicService(fakeClient)
    val refreshJob = Await.result(topMentionService.refreshTopicsDetails(), 1.second)

    val result =
      topMentionService.getTopicResult("key1", Topic(TopicType.Org, "someRandomOrg"))

    result should equal(None)
  }
}

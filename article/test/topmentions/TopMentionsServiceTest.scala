package topmentions

import model.{TopMentionEntity, TopMentionsDetails, TopMentionsResult}
import org.scalatest.BeforeAndAfterAll
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
      `type` = TopMentionEntity.Org,
      blocks = Seq("blockId1"),
      count = 1,
      percentage_blocks = 1.2f,
    )
  val successResponse =
    TopMentionsDetails(entity_types = Seq(TopMentionEntity.Org), results = Seq(topMentionResult), model = "model")

  "refreshTopMentions" should "return successfull future given getListOfKeys s3 call fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.failed(new Throwable(""))
    val topMentionService = new TopMentionsService(fakeClient)

    Await.result(topMentionService.refreshTopMentions(), 1.second)
    val results = topMentionService.getAllTopMentions

    results should be(None)
  }

  "refreshTopMentions" should "return successfull future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1", "key2"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    when(fakeClient.getObject("key2")) thenReturn Future.failed(new Throwable("error happend"))

    val topMentionService = new TopMentionsService(fakeClient)

    val refreshJob = Await.result(topMentionService.refreshTopMentions(), 1.second)
    val results = topMentionService.getAllTopMentions

    refreshJob shouldBe a[Unit]
    results should be(None)
  }

  "refreshTopMentions" should "update in memory top mentions and return successfull future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val topMentionService = new TopMentionsService(fakeClient)

    val refreshJob = Await.result(topMentionService.refreshTopMentions(), 1.second)
    val results = topMentionService.getAllTopMentions

    refreshJob shouldBe a[Unit]
    results.isDefined should be(true)
    results.get.get("key1") should equal(Some(successResponse))
  }
}

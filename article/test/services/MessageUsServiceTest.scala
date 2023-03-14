package services

import model.{FieldType, EmailField, MessageUsConfigData, MessageUsData, NameField, TextAreaField}
import org.mockito.ArgumentMatchers.{startsWith, eq => mockitoEq}
import org.mockito.Matchers.{any, anyString}
import org.scalatest.BeforeAndAfterAll
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test.WithTestExecutionContext
import org.mockito.Mockito._
import org.scalatestplus.mockito.MockitoSugar
import play.api.{Logger, MarkerContext}
import play.api.libs.json.Reads

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

class MessageUsServiceTest
    extends AnyFlatSpec
    with Matchers
    with BeforeAndAfterAll
    with WithTestExecutionContext
    with MockitoSugar {

  val fakeClient = mock[S3Client[MessageUsConfigData]]

  val formFields = List(
    NameField("nameField1", "name", "name", FieldType.Name),
    EmailField("emailField1", "email", "email", FieldType.Email),
    TextAreaField("textAreaField1", "textArea", "textArea", FieldType.TextArea),
  )
  val successResponse = MessageUsConfigData(articleId = "key1", formId = "form1", formFields = formFields)

  "refreshMessageUsData" should "return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1", "key2"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    when(fakeClient.getObject("key2")) thenReturn Future.failed(new Throwable("error happend"))

    val messageUsService = new MessageUsService(fakeClient)

    val refreshJob = Await.result(messageUsService.refreshMessageUsData(), 1.second)
    val results = messageUsService.getAllMessageUsConfigData

    refreshJob shouldBe a[Unit]
    results should be(None)
  }

  "refreshMessageUsData" should "update in memory messageUsConfigData and return successful future given one of the S3 object calls fails" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)

    val messageUsService = new MessageUsService(fakeClient)

    val refreshJob = Await.result(messageUsService.refreshMessageUsData(), 1.second)
    val results = messageUsService.getAllMessageUsConfigData

    refreshJob shouldBe a[Unit]
    results.isDefined should be(true)
    results.get.get("key1") should equal(Some(successResponse))
  }

  "refreshMessageUsData" should "update in memory messageUsConfigData with only the first 50 items given 60 records in S3" in {
    val keys = (1 until 60).map(key => s"key${key}").toList
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(keys)
    when(fakeClient.getObject(anyString())(any[Reads[MessageUsConfigData]])) thenReturn Future.successful(
      successResponse,
    )

    val messageUsService = new MessageUsService(fakeClient)

    val refreshJob = Await.result(messageUsService.refreshMessageUsData(), 1.second)
    val results = messageUsService.getAllMessageUsConfigData

    refreshJob shouldBe a[Unit]
    results.get.size should equal(50)
  }

  "getBlogMessageUsConfigData" should "return none given a blog id that doesn't exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    val messageUsService = new MessageUsService(fakeClient)

    val refreshJob = Await.result(messageUsService.refreshMessageUsData(), 1.second)
    val result = messageUsService.getBlogMessageUsData("key2")

    result should equal(None)
  }

  "getBlogMessageUsConfigData" should "return the blog specific messageUsConfigData given a blog id that exist in cache" in {
    when(fakeClient.getListOfKeys()) thenReturn Future.successful(List("key1"))
    when(fakeClient.getObject("key1")) thenReturn Future.successful(successResponse)
    val messageUsService = new MessageUsService(fakeClient)

    val refreshJob = Await.result(messageUsService.refreshMessageUsData(), 1.second)
    val result = messageUsService.getBlogMessageUsData("key1")

    val expected = MessageUsData(formId = "form1")
    result should equal(Some(expected))
  }
}

package controllers

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers._
import org.mockito.Mockito._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json._
import play.api.libs.ws._
import play.api.mvc.AnyContentAsEmpty
import play.api.test.FakeRequest
import services.newsletters.NewsletterSignupAgent
import test.WithTestExecutionContext

import scala.concurrent.Future

class EmailFormServiceTest
    extends AnyWordSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestExecutionContext {

  trait Fixture {
    val wsClient: WSClient = mock[WSClient]
    val wsRequest: WSRequest = mock[WSRequest]
    val wsResponse: WSResponse = mock[WSResponse]
    val newsletterSignupAgent: NewsletterSignupAgent = mock[NewsletterSignupAgent]

    val service = new EmailFormService(wsClient, newsletterSignupAgent)

    val singleNewsletterBaseForm: EmailForm = EmailForm(
      email = "test@example.com",
      listName = Some("the-long-read"),
      marketing = None,
      referrer = None,
      ref = None,
      refViewId = None,
      browserId = None,
      campaignCode = None,
      googleRecaptchaResponse = None,
      name = None,
    )

    val multipleNewslettersBaseForm: EmailFormManyNewsletters = EmailFormManyNewsletters(
      email = "test@example.com",
      listNames = Seq("the-long-read", "morning-briefing"),
      marketing = None,
      referrer = None,
      ref = None,
      refViewId = None,
      campaignCode = None,
      googleRecaptchaResponse = None,
      name = None,
    )

    when(newsletterSignupAgent.getV2NewsletterByName(any[String])) thenReturn Left("test")
    when(wsClient.url(any[String])) thenReturn wsRequest
    when(wsRequest.withQueryStringParameters(any())) thenReturn wsRequest
    when(wsRequest.addHttpHeaders(any())) thenReturn wsRequest
    when(wsRequest.post(any[JsValue])(any[BodyWritable[JsValue]])) thenReturn Future.successful(wsResponse)
    when(wsResponse.status) thenReturn 200
  }

  def capturePostedBody(wsRequest: WSRequest): JsObject = {
    val captor: ArgumentCaptor[JsValue] = ArgumentCaptor.forClass(classOf[JsValue])
    verify(wsRequest).post(captor.capture())(any())
    captor.getValue.as[JsObject]
  }

  // privateFields serializes as [["registrationLocation", ImALocation], ["registrationLocationState", IamALocationState]]
  def registrationLocation(body: JsObject): String =
    (body \ "privateFields")(0)(1).as[String]

  def registrationLocationState(body: JsObject): JsValue =
    (body \ "privateFields")(1)(1)

  "EmailFormService.submit" when {

    "getting registrationLocation from X-GU-GeoLocation header" should {

      "use the country group name for a known country code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest().withHeaders("X-GU-GeoLocation" -> "country:GB")
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocation(capturePostedBody(wsRequest)) shouldBe "United Kingdom"
      }

      "use 'Other' for an unrecognised country code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest().withHeaders("X-GU-GeoLocation" -> "country:XX")
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocation(capturePostedBody(wsRequest)) shouldBe "Other"
      }

      "use 'Other' when the X-GU-GeoLocation header isn't present" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest()
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocation(capturePostedBody(wsRequest)) shouldBe "Other"
      }
    }

    "getting registrationLocationState from X-GU-GeoIP-Region header" should {

      "get US state name from state code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation" -> "country:US",
          "X-GU-GeoIP-Region" -> "CA",
        )
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsString("California")
      }

      "get AU state name from state code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation" -> "country:AU",
          "X-GU-GeoIP-Region" -> "NSW",
        )
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsString("New South Wales")
      }

      "not be there (None) when the country is US but no state header is present" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest().withHeaders("X-GU-GeoLocation" -> "country:US")
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }

      "not be there (None) when the country is US but the state code is unrecognised" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation" -> "country:US",
          "X-GU-GeoIP-Region" -> "ZZ",
        )
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }

      "not be there (None) for a non-US/AU country even when a region header is present" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation" -> "country:GB",
          "X-GU-GeoIP-Region" -> "ENG",
        )
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }

      "not be there (None) when the X-GU-GeoLocation header is missing" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest()
        service.submit(singleNewsletterBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }
    }
  }

  "EmailFormService.submitWithMany" when {

    "getting registrationLocation from X-GU-GeoLocation header" should {

      "use the country group name for a known country code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest().withHeaders("X-GU-GeoLocation" -> "country:GB")
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocation(capturePostedBody(wsRequest)) shouldBe "United Kingdom"
      }

      "use 'Other' for an unrecognised country code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest().withHeaders("X-GU-GeoLocation" -> "country:XX")
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocation(capturePostedBody(wsRequest)) shouldBe "Other"
      }

      "use 'Other' when the X-GU-GeoLocation header isn't present" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest()
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocation(capturePostedBody(wsRequest)) shouldBe "Other"
      }
    }

    "getting registrationLocationState from X-GU-GeoIP-Region header" should {

      "get US state name from state code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation"  -> "country:US",
          "X-GU-GeoIP-Region" -> "CA",
        )
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsString("California")
      }

      "get AU state name from state code" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation"  -> "country:AU",
          "X-GU-GeoIP-Region" -> "NSW",
        )
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsString("New South Wales")
      }

      "not be there (None) when the country is US but no state header is present" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest().withHeaders("X-GU-GeoLocation" -> "country:US")
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }

      "not be there (None) when the country is US but the state code is unrecognised" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation"  -> "country:US",
          "X-GU-GeoIP-Region" -> "ZZ",
        )
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }

      "not be there (None) for a non-US/AU country even when a region header is present" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withHeaders(
          "X-GU-GeoLocation"  -> "country:GB",
          "X-GU-GeoIP-Region" -> "ENG",
        )
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }

      "not be there (None) when the X-GU-GeoLocation header is missing" in new Fixture {
        implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest()
        service.submitWithMany(multipleNewslettersBaseForm).futureValue
        registrationLocationState(capturePostedBody(wsRequest)) shouldBe JsNull
      }
    }
  }
}

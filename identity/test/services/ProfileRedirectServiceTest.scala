package services

import com.gu.identity.model.{EmailList, StatusFields, Subscriber, User}
import idapiclient.{IdApiClient, TrackingData}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{Matchers, path}
import play.api.mvc.{AnyContent, _}
import play.api.test.FakeRequest
import test.{WithTestExecutionContext, WithTestIdConfig}
import org.mockito.Matchers.anyString
import org.mockito.Matchers.any
import org.mockito.Mockito._
import play.api.data.Form
import org.mockito.{Matchers => MockitoMatchers}
import play.api.http.HttpConfiguration

import scala.concurrent.Future


class ProfileRedirectServiceTest extends path.FreeSpec with MockitoSugar with ScalaFutures with Matchers with WithTestIdConfig with WithTestExecutionContext {


  trait TestFixture {

    val controllerComponents: ControllerComponents = play.api.test.Helpers.stubControllerComponents()
    val idUrlBuilder = mock[IdentityUrlBuilder]
    val api = mock[IdApiClient]
    val idRequestParser = mock[IdRequestParser]
    val authService = mock[AuthenticationService]
    val idRequest = mock[IdentityRequest]
    val trackingData = mock[TrackingData]
    val returnUrlVerifier = mock[ReturnUrlVerifier]
    val newsletterService = mock[NewsletterService]
    val httpConfiguration = HttpConfiguration.createWithDefaults()
    val emailForm = mock[Form[EmailPrefsData]]

    when(idRequestParser.apply(MockitoMatchers.anyObject())) thenReturn idRequest
    when(idRequest.trackingData) thenReturn trackingData
    when(idRequestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest
    when(newsletterService.subscriptions(any[String], any[TrackingData])) thenReturn Future(emailForm)
    when(api.userEmails(anyString(), any[TrackingData])) thenReturn Future.successful(Right(Subscriber("Text", List(EmailList("37")))))


    val userWithValidEmailAndHasRepermed = new User(statusFields = new StatusFields(userEmailValidated = Some(true), hasRepermissioned = Some(true)))
    val userWithoutValidEmail = new User(statusFields = new StatusFields(userEmailValidated = Some(false)))
    val profileRedirectService = new ProfileRedirectService(newsletterService, idRequestParser, controllerComponents)

    val originalUrl = "https://profile.thegulocal.com/email-prefs"
    val request = Request(FakeRequest("GET", originalUrl), AnyContent())

  }

  "The ProfileRedirect Service should" - {

      "redirect to /email-prefs when the user has a validated email and has completed the consent journey" in new TestFixture {

        when(newsletterService.getV1EmailSubscriptions(emailForm)) thenReturn List.empty

        val result: Future[ProfileRedirect] = profileRedirectService.toProfileRedirect(userWithValidEmailAndHasRepermed, request)

        whenReady(result)(_ shouldBe NoRedirect)
      }

    "redirect to newsletter consents when user still has v1 subscriptions" in new TestFixture {
      when(newsletterService.getV1EmailSubscriptions(emailForm)) thenReturn List("somethingHere")

      val result: Future[ProfileRedirect] = profileRedirectService.toProfileRedirect(userWithValidEmailAndHasRepermed, request)

      whenReady(result)(_ shouldBe RedirectToNewsletterConsentsFromEmailPrefs)
    }

    "redirect to email validation if user has not validated their email" in new TestFixture {
      val result : Future[ProfileRedirect] = profileRedirectService.toProfileRedirect(userWithoutValidEmail, request)

      whenReady(result)( _ shouldBe RedirectToEmailValidationFromEmailPrefs)
    }

     "don't redirect from account details page even without validated email" in new TestFixture {

       val accountDetailsUrl = "https://profile.thegulocal.com/account/edit"
       val fakeRequest = Request(FakeRequest("GET", accountDetailsUrl), AnyContent())

       val result : Future[ProfileRedirect] = profileRedirectService.toProfileRedirect(userWithoutValidEmail, fakeRequest)

       whenReady(result){ res =>
         res.isAllowedFrom(accountDetailsUrl) shouldBe false
       }
     }

    "don't redirect to email verification if the tab is not /email-prefs" in new TestFixture {
      val membershipEditUrl = "https://profile.thegulocal.com/membership/edit"
      val fakeRequest = Request(FakeRequest("GET", membershipEditUrl), AnyContent())

      val result : Future[ProfileRedirect] = profileRedirectService.toProfileRedirect(userWithoutValidEmail, fakeRequest)

      whenReady(result){ res =>
        res.isAllowedFrom(membershipEditUrl) shouldBe false
      }
    }
  }
}

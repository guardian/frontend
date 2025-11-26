package actions

import java.net.URLEncoder
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{StatusFields, User}
import idapiclient.{Auth, IdApiClient, ScGuRp, ScGuU}
import org.mockito.Mockito._
import org.scalatest.concurrent.ScalaFutures
import org.mockito.Matchers.any
import play.api.mvc.{AnyContent, _}
import play.api.test.{FakeRequest, Helpers}
import services._
import test.{WithTestExecutionContext, WithTestIdConfig}
import idapiclient.Response
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpecLike
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.Future

class AuthenticatedActionsTest
    extends AnyWordSpecLike
    with MockitoSugar
    with ScalaFutures
    with Matchers
    with WithTestIdConfig
    with WithTestExecutionContext {

  trait TestFixture {
    val expectedEventParameters =
      "componentEventParams=componentType%3Didentityauthentication%26componentId%3Dsignin_redirect_for_action"

    val authService = mock[AuthenticationService]
    val client: IdApiClient = mock[IdApiClient]
    val idRequestParser: IdRequestParser = mock[IdRequestParser]
    val controllerComponents: ControllerComponents = mock[ControllerComponents]
    val user = User(
      "",
      "test@example.com",
      statusFields = new StatusFields(userEmailValidated = Some(true)),
    )
    val newsletterService: NewsletterService = mock[NewsletterService]
    val rpCookie = mock[ScGuRp]
    val guUCookie = mock[ScGuU]
    val recentlyAuthedUser = AuthenticatedUser(user, guUCookie, true)
    val notRecentlyAuthedUser = AuthenticatedUser(user, guUCookie, false)
    val mockResponse = mock[Response[User]]

    val actions = new AuthenticatedActions(
      authService,
      client,
      new IdentityUrlBuilder(testIdConfig),
      Helpers.stubControllerComponents(),
    )
    val userWithRpCookie = AuthenticatedUser(user, rpCookie)

  }

  "The manage my account action" should {
    def failTest: AuthRequest[AnyContent] => Result = _ => fail("Block was invoked")

    "redirect to /reauthenticate when the user is not recently authenticated" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/email-prefs"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())

      when(authService.fullyAuthenticatedUser(any[RequestHeader])).thenReturn(Some(notRecentlyAuthedUser))

      val result = actions.consentAuthWithIdapiUserWithEmailValidation.apply(failTest)(request)
      val expectedLocation =
        s"/reauthenticate?returnUrl=${URLEncoder.encode(originalUrl, "utf-8")}&$expectedEventParameters"
      whenReady(result) { res =>
        res.header.status shouldBe 303
        res.header.headers should contain("Location" -> expectedLocation)
      }
    }

    "go straight to /email-prefs when a user is recently authenticated and has repermissioned and has valid email" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/email-prefs"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())
      val mockFunc = mock[Int => Result]

      def callMock: AuthRequest[AnyContent] => Result = _ => mockFunc.apply(1)

      when(authService.fullyAuthenticatedUser(any[RequestHeader])).thenReturn(Some(recentlyAuthedUser))
      when(client.me(any[Auth])).thenReturn(Future(Right(user)))
      when(mockFunc.apply(1)) thenReturn mock[Result]

      val result = actions.consentAuthWithIdapiUserWithEmailValidation.apply(callMock)(request)

      // We get a mock result back so we just want to ensure the mockFunc has been run rather than check its content
      whenReady(result)(res => {
        verify(mockFunc).apply(1)
      })
    }
  }

  "The consent journey redirect action" should {
    def failTest: AuthRequest[AnyContent] => Result = _ => fail("Block was invoked")

    "redirect to /signin when the user is not authenticated" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/consents"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())

      when(authService.fullyAuthenticatedUser(any[RequestHeader])).thenReturn(None)
      when(authService.consentCookieAuthenticatedUser(any[RequestHeader])).thenReturn(None)

      val result = actions.consentAuthWithIdapiUserWithEmailValidation.apply(failTest)(request)
      val expectedLocation = s"/signin?returnUrl=${URLEncoder.encode(originalUrl, "utf-8")}&$expectedEventParameters"
      whenReady(result) { res =>
        res.header.status shouldBe 303
        res.header.headers should contain("Location" -> expectedLocation)
      }
    }

    "not redirect and return 200 when a user is authenticated via an RP cookie" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/consents"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())

      when(authService.fullyAuthenticatedUser(any[RequestHeader])).thenReturn(None)
      when(authService.consentCookieAuthenticatedUser(any[RequestHeader])).thenReturn(Some(userWithRpCookie))
      when(client.me(any[Auth])).thenReturn(Future(Right(user)))

      val mockFunc = mock[Int => Result]
      when(mockFunc.apply(1)) thenReturn mock[Result]
      def callMock: AuthRequest[AnyContent] => Result = _ => mockFunc.apply(1)

      val result = actions.consentAuthWithIdapiUserWithEmailValidation.apply(callMock)(request)
      whenReady(result) { res =>
        verify(mockFunc).apply(1)
      }
    }

    "not redirect and return 200 when a user is authenticated via a GU_U cookie" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/consents"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())

      when(authService.fullyAuthenticatedUser(any[RequestHeader])).thenReturn(Some(recentlyAuthedUser))
      when(authService.consentCookieAuthenticatedUser(any[RequestHeader])).thenReturn(None)
      when(client.me(any[Auth])).thenReturn(Future(Right(user)))

      val mockFunc = mock[Int => Result]
      when(mockFunc.apply(1)) thenReturn mock[Result]
      def callMock: AuthRequest[AnyContent] => Result = _ => mockFunc.apply(1)

      val result = actions.consentAuthWithIdapiUserWithEmailValidation.apply(callMock)(request)
      whenReady(result) { res =>
        verify(mockFunc).apply(1)
      }
    }

    "redirect to reauth when a user is authenticated via a GU_U cookie but not recently" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/consents"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())

      when(authService.fullyAuthenticatedUser(any[RequestHeader])).thenReturn(Some(notRecentlyAuthedUser))
      when(authService.consentCookieAuthenticatedUser(any[RequestHeader])).thenReturn(None)

      val result = actions.consentAuthWithIdapiUserWithEmailValidation.apply(failTest)(request)
      val expectedLocation =
        s"/reauthenticate?returnUrl=${URLEncoder.encode(originalUrl, "utf-8")}&$expectedEventParameters"
      whenReady(result) { res =>
        res.header.status shouldBe 303
        res.header.headers should contain("Location" -> expectedLocation)
      }
    }
  }
}

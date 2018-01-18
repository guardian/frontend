package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import com.google.common.util.concurrent.MoreExecutors
import idapiclient.IdApiClient
import org.mockito.Mockito._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{Matchers, WordSpecLike}
import play.api.libs.streams.Accumulator
import play.api.mvc._
import play.api.test.{FakeRequest, Helpers}
import services._
import test.{WithTestExecutionContext, WithTestIdConfig}

class AuthenticatedActionsTest extends WordSpecLike with MockitoSugar with ScalaFutures with Matchers with WithTestIdConfig with WithTestExecutionContext {

  trait TestFixture {
    val authService = mock[AuthenticationService]
    val client: IdApiClient = mock[IdApiClient]
    val actions = new AuthenticatedActions(authService, client, new IdentityUrlBuilder(testIdConfig), Helpers.stubControllerComponents(), mock[NewsletterService], mock[IdRequestParser], mock[ProfileRedirectService])
  }

  "The Consent Journey Redirect Action" should {
    def failTest: AuthRequest[AnyContent] => Result = _ => fail("Block was invoked")
    "redirect to /reauthenticate when the user is not authenticated" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/email-prefs"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())
      when(authService.consentAuthenticatedUser(request)).thenReturn(None)
      val result = actions.manageAccountRedirectAction(originalUrl).apply(failTest)(request)
      val expectedLocation = s"/reauthenticate?INTCMP=email&returnUrl=${URLEncoder.encode(originalUrl, "utf-8")}"
      whenReady(result) { res =>
        res.header.status shouldBe 303
        res.header.headers should contain("Location" -> expectedLocation)
      }
    }
  }

}

package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import com.google.common.util.concurrent.MoreExecutors
import com.gu.identity.cookie.GuUCookieData
import com.gu.identity.model.User
import idapiclient.{IdApiClient, ScGuU}
import org.mockito.Mockito._
import org.mockito.Matchers.any
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{Matchers, WordSpecLike}
import play.api.libs.streams.Accumulator
import play.api.mvc._
import play.api.test.FakeRequest
import services._
import test.WithTestIdConfig

import scala.concurrent.{ExecutionContext, Future}

class AuthenticatedActionsTest extends WordSpecLike with MockitoSugar with ScalaFutures with Matchers with WithTestIdConfig {

  implicit val ec = ExecutionContext.fromExecutor(MoreExecutors.directExecutor())

  trait TestFixture {
    val authService = mock[AuthenticationService]
    val components = mock[ControllerComponents]
    when(components.executionContext).thenReturn(ec)
    val client: IdApiClient = mock[IdApiClient]
    val actions = new AuthenticatedActions(authService, client, new IdentityUrlBuilder(testIdConfig), components, mock[NewsletterService], mock[IdRequestParser]) {
      override protected def noOpActionBuilder: DefaultActionBuilder =
        DefaultActionBuilder(BodyParser[AnyContent]("test")(_ => Accumulator.done[Either[Result, AnyContent]](Right(AnyContent()))))
    }
  }

  "The Consent Journey Redirect Action" should afterWord("redirect to /reauthenticate when") {

    def failTest: AuthRequest[AnyContent] => Result = _ => fail("Block was invoked")

    "not produce nested redirects from signin" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/email-prefs"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())
      val user = User("identitydev@guardian.co.uk")
      when(authService.consentAuthenticatedUser(request)).thenReturn(Some(AuthenticatedUser(user, ScGuU("test", GuUCookieData(user, Long.MaxValue, Some(true))))))
      when(client.me(any())).thenReturn(Future.successful(Left(List.empty)))
      val result = actions.consentJourneyRedirectAction.apply(failTest)(request)
      whenReady(result) { res =>
        res.header.status shouldBe 303
        res.header.headers should contain("Location" -> s"/reauthenticate?INTCMP=email&returnUrl=${URLEncoder.encode(originalUrl, "utf-8")}")
      }
    }
  }

}

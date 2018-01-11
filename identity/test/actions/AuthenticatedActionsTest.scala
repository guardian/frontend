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
import play.api.test.FakeRequest
import services._
import test.WithTestIdConfig

import scala.concurrent.ExecutionContext

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

  "The Consent Journey Redirect Action" should {
    def failTest: AuthRequest[AnyContent] => Result = _ => fail("Block was invoked")
    "redirect to /signin instead of /reauthenticate in to prevent redirect loops" in new TestFixture {
      val originalUrl = "https://profile.thegulocal.com/email-prefs"
      val request = Request(FakeRequest("GET", originalUrl), AnyContent())
      when(authService.consentAuthenticatedUser(request)).thenReturn(None)
      val result = actions.consentJourneyRedirectAction.apply(failTest)(request)
      val expectedLocation = s"/signin?INTCMP=email&returnUrl=${URLEncoder.encode(originalUrl, "utf-8")}"
      whenReady(result) { res =>
        res.header.status shouldBe 303
        res.header.headers should contain("Location" -> expectedLocation)
      }
    }
  }

}

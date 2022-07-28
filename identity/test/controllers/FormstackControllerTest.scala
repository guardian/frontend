package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.User
import conf.FrontendIdentityCookieDecoder
import conf.switches.Switches
import formstack.{FormstackApi, FormstackForm}
import idapiclient.responses.Error
import idapiclient.{IdApiClient, ScGuU, TrackingData}
import org.mockito.{Matchers => MockitoMatchers}
import org.mockito.Mockito._
import org.scalatest.freespec.PathAnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.RequestHeader
import play.api.test.Helpers._
import services._
import test.{Fake, TestRequest, WithTestApplicationContext, WithTestExecutionContext}

import scala.concurrent.{ExecutionContext, Future}

class FormstackControllerTest
    extends PathAnyFreeSpec
    with Matchers
    with WithTestApplicationContext
    with WithTestExecutionContext
    with MockitoSugar {

  private val controllerComponents = play.api.test.Helpers.stubControllerComponents()

  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val formstackApi = mock[FormstackApi]

  val cookieDecoder = mock[FrontendIdentityCookieDecoder]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]
  val authService = mock[AuthenticationService]
  val api = mock[IdApiClient]
  val newsletterService = spy(new NewsletterService(api))

  val userId = "123"
  val user = User("test@example.com", userId)
  val authenticatedActions = new AuthenticatedActions(
    authService,
    mock[IdApiClient],
    mock[IdentityUrlBuilder],
    controllerComponents,
    newsletterService,
    requestParser,
  )

  when(authService.fullyAuthenticatedUser(MockitoMatchers.any[RequestHeader])) thenReturn Some(
    AuthenticatedUser(user, ScGuU("abc")),
  )

  when(requestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val controller = new FormstackController(
    returnUrlVerifier,
    requestParser,
    idUrlBuilder,
    authenticatedActions,
    formstackApi,
    controllerComponents,
  )

  "when switched off" - {
    Switches.IdentityFormstackSwitch.switchOff()

    "the formstack page will not be displayed" in Fake {
      val result = controller.formstackForm("test-reference", false)(TestRequest())
      status(result) should equal(NOT_FOUND)
    }
  }

  "when switched on" - {
    Switches.IdentityFormstackSwitch.switchOn()

    "if the form is valid" - {
      when(
        formstackApi.checkForm(MockitoMatchers.any[FormstackForm])(MockitoMatchers.any[ExecutionContext]),
      ) thenReturn Future.successful(Right(FormstackForm("test-reference", "view-id", None)))

      "the formstack page is displayed" in Fake {
        val result = controller.formstackForm("test-reference", false)(TestRequest())
        status(result) should equal(OK)
      }
    }

    "when the form is not valid" - {
      when(
        formstackApi.checkForm(MockitoMatchers.any[FormstackForm])(MockitoMatchers.any[ExecutionContext]),
      ) thenReturn Future.successful(Left(List(Error("Test message", "Test description", 404))))

      "the formstack page should not be shown and passes status code from errors" in Fake {
        val result = controller.formstackForm("test-reference", false)(TestRequest())
        status(result) should equal(404)
      }
    }
  }
}

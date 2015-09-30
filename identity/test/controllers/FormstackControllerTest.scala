package controllers

import actions.AuthenticatedActions
import client.Error
import com.gu.identity.cookie.GuUCookieData
import com.gu.identity.model.{StatusFields, User}
import conf.FrontendIdentityCookieDecoder
import conf.switches.Switches
import formstack.{FormstackApi, FormstackForm}
import idapiclient.{IdApiClient, ScGuU, TrackingData}
import org.mockito.Matchers
import org.mockito.Mockito._
import org.scalatest.mock.MockitoSugar
import org.scalatest.{ShouldMatchers, path}
import play.api.mvc.RequestHeader
import play.api.test.Helpers._
import services.{IdentityRequest, _}
import test.{Fake, TestRequest}

import scala.concurrent.Future


class FormstackControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val formstackApi = mock[FormstackApi]

  val cookieDecoder = mock[FrontendIdentityCookieDecoder]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]
  val authService = mock[AuthenticationService]

  val userId = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
  val authenticatedActions = new AuthenticatedActions(authService, mock[IdApiClient], mock[IdentityUrlBuilder])

  when(authService.authenticatedUserFor(Matchers.any[RequestHeader])) thenReturn Some(AuthenticatedUser(user, ScGuU("abc", GuUCookieData(user, 0, None))))

  when(requestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val controller = new FormstackController(returnUrlVerifier, requestParser, idUrlBuilder, authenticatedActions, formstackApi)

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
      when(formstackApi.checkForm(Matchers.any[FormstackForm])) thenReturn Future.successful(Right(FormstackForm("test-reference", "view-id", None)))

      "the formstack page is displayed" in Fake {
        val result = controller.formstackForm("test-reference", false)(TestRequest())
        status(result) should equal(OK)
      }
    }

    "when the form is not valid" - {
      when(formstackApi.checkForm(Matchers.any[FormstackForm])) thenReturn Future.successful(Left(List(Error("Test message", "Test description", 404))))

      "the formstack page should not be shown and passes status code from errors" in Fake {
        val result = controller.formstackForm("test-reference", false)(TestRequest())
        status(result) should equal(404)
      }
    }
  }
}

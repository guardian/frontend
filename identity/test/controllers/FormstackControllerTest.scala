package controllers

import org.scalatest.{ShouldMatchers, path}
import org.scalatest.mock.MockitoSugar
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import formstack.{FormstackForm, FormstackApi}
import play.api.mvc.{RequestHeader, SimpleResult, Request}
import scala.concurrent.Future
import conf.{Switches, FrontendIdentityCookieDecoder}
import idapiclient.ScGuU
import com.gu.identity.model.{StatusFields, User}
import org.mockito.Mockito._
import org.mockito.Matchers
import utils.AuthRequest
import services.IdentityRequest
import client.Error
import idapiclient.TrackingData
import scala.Some
import test.{TestRequest, Fake}
import play.api.test.Helpers._


class FormstackControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val formstackApi = mock[FormstackApi]

  val cookieDecoder = mock[FrontendIdentityCookieDecoder]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]

  val userId = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
  val testAuth = new ScGuU("abc")

  val authAction  = new utils.AuthAction(cookieDecoder, requestParser, idUrlBuilder) {
    override protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]): Future[SimpleResult] = {
      block(AuthRequest(request, user, testAuth))
    }
  }
  when(requestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val controller = new FormstackController(returnUrlVerifier, requestParser, idUrlBuilder, authAction, formstackApi)

  "when sitched off" - {
    Switches.IdentityFormstackSwitch.switchOff()

    "the formstack page will not be displayed" in Fake {
      val result = controller.formstackForm("test-reference")(TestRequest())
      status(result) should equal(NOT_FOUND)
    }
  }

  "when switched on" - {
    Switches.IdentityFormstackSwitch.switchOn()

    "if the form is valid" - {
      when(formstackApi.checkForm(Matchers.any[FormstackForm])) thenReturn Future.successful(Right(FormstackForm("test-reference", "view-id", None)))

      "the formstack page is displayed" in Fake {
        val result = controller.formstackForm("test-reference")(TestRequest())
        status(result) should equal(OK)
      }
    }

    "when the form is not valid" - {
      when(formstackApi.checkForm(Matchers.any[FormstackForm])) thenReturn Future.successful(Left(List(Error("Test message", "Test description", 404))))

      "the formstack page should not be shown and passes status code from errors" in Fake {
        val result = controller.formstackForm("test-reference")(TestRequest())
        status(result) should equal(404)
      }
    }
  }
}

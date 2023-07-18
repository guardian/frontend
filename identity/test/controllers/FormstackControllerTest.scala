package controllers

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

  val userId = "123"
  val user = User("test@example.com", userId)

  val controller = new FormstackController(
    returnUrlVerifier,
    requestParser,
    idUrlBuilder,
    formstackApi,
    controllerComponents,
  )

  "when switched off" - {
    Switches.IdentityFormstackSwitch.switchOff()

    "the formstack page will not be displayed" in Fake {
      val result = controller.formstackForm("test-reference")(TestRequest())
      status(result) should equal(NOT_FOUND)
    }
  }

  "when switched on" - {
    Switches.IdentityFormstackSwitch.switchOn()

    "the formstack page will not be displayed" in Fake {
      val result = controller.formstackForm("test-reference")(TestRequest())
      status(result) should equal(NOT_FOUND)
    }
  }
}

package controllers

import conf.switches.Switches
import idapiclient.responses.Error
import org.mockito.{ArgumentMatchers => MockitoMatchers}
import org.mockito.Mockito._
import org.scalatest.freespec.PathAnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.RequestHeader
import play.api.test.Helpers._
import services._
import test.{Fake, TestRequest, WithTestApplicationContext, WithTestExecutionContext}
import scala.concurrent.{ExecutionContext}

class FormstackControllerTest
    extends PathAnyFreeSpec
    with Matchers
    with WithTestApplicationContext
    with WithTestExecutionContext
    with MockitoSugar {

  private val controllerComponents = play.api.test.Helpers.stubControllerComponents()

  val controller = new FormstackController(
    controllerComponents,
  )

  "the formstack page will not be displayed" in Fake {
    val result = controller.formstackForm("test-reference")(TestRequest())
    status(result) should equal(NOT_FOUND)
  }
}

package actions

import org.scalatest.{ShouldMatchers, FunSuite}
import services.AuthenticationService
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import play.api.mvc.{AnyContent, Request}
import play.api.mvc.Results.{SeeOther, Ok}
import com.gu.identity.model.User
import idapiclient.ScGuU
import scala.concurrent.{Future, Await}
import scala.concurrent.duration._
import scala.language.postfixOps


class AuthActionTest extends FunSuite with ShouldMatchers with MockitoSugar {
  val authService = mock[AuthenticationService]
  val request = mock[Request[AnyContent]]
  val badResponse = SeeOther("http://example.com/error")
  val goodResponse = Ok("")
  val authRequest = new AuthRequest(request, User(), new ScGuU("test"))

  val authAction = new AuthenticatedAction(authService)

  test("if authentication fails, should return the error") {
    when(authService.handleAuthenticatedRequest(request)) thenReturn Left(badResponse)

    val result = authAction.apply { request =>
      goodResponse
    }(request)

    Await.result(result, 10 millis) should equal(badResponse)
  }

  test("(async) if authentication fails, should return the error") {
    when(authService.handleAuthenticatedRequest(request)) thenReturn Left(badResponse)

    val result = authAction.async { request =>
      Future.successful(goodResponse)
    }(request)

    Await.result(result, 10 millis) should equal(badResponse)
  }

  test("if authentication succeeds, should pass the auth request and return the block's response") {
    when(authService.handleAuthenticatedRequest(request)) thenReturn Right(authRequest)

    val result = authAction.apply { request =>
      request should equal(authRequest)
      goodResponse
    }(request)

    Await.result(result, 10 millis) should equal(goodResponse)
  }

  test("(async) if authentication succeeds, should pass the auth request and return the block's response") {
    when(authService.handleAuthenticatedRequest(request)) thenReturn Right(authRequest)

    val result = authAction.async { request =>
      request should equal(authRequest)
      Future.successful(goodResponse)
    }(request)

    Await.result(result, 10 millis) should equal(goodResponse)
  }
}

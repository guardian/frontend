package controllers

import org.scalatest.{ShouldMatchers, path}
import org.scalatest.mock.MockitoSugar
import services.{IdentityRequest, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import formstack.FormstackApi
import play.api.mvc.{RequestHeader, SimpleResult, Request}
import utils.AuthRequest
import scala.concurrent.Future
import conf.FrontendIdentityCookieDecoder
import idapiclient.{ScGuU, TrackingData}
import com.gu.identity.model.{StatusFields, User}
import client.Error
import org.mockito.Mockito._
import org.mockito.Matchers
import utils.AuthRequest
import services.IdentityRequest
import client.Error
import idapiclient.TrackingData
import scala.Some

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
  val error = Error("Test message", "Test description", 500)

  val authAction  = new utils.AuthAction(cookieDecoder, requestParser, idUrlBuilder) {
    override protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]): Future[SimpleResult] = {
      block(AuthRequest(request, user, testAuth))
    }
  }
  when(requestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val controller = new FormstackController(returnUrlVerifier, requestParser, idUrlBuilder, authAction, formstackApi)


}

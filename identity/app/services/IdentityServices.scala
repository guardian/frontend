package services

import com.gu.identity.play.IdentityPlayAuthService
import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import idapiclient.IdApiComponents
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

trait IdentityServices extends IdentityConfigurationComponents with IdApiComponents {

  def wsClient: WSClient
  def controllerComponents: ControllerComponents
  implicit val executionContext: ExecutionContext

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]

  lazy val returnUrlVerifier = wire[ReturnUrlVerifier]
  lazy val idRequestParser = wire[IdRequestParser]
  lazy val identityUrlBuilder = wire[IdentityUrlBuilder]
  lazy val playSigninService = wire[PlaySigninService]
  lazy val identityAuthService: IdentityPlayAuthService = ???
  lazy val identityCookieService: IdentityCookieService = ???
  lazy val authenticationService = wire[AuthenticationService]
  lazy val torNodeLoggingIdRequestParser = wire[TorNodeLoggingIdRequestParser]
  lazy val emailService = wire[NewsletterService]
  lazy val mdapiService = wire[MembersDataApiService]
}

package services

import java.util.concurrent.{Executors, ThreadPoolExecutor}

import com.gu.identity.cookie.IdentityCookieService
import com.gu.identity.play.IdentityPlayAuthService
import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import idapiclient.IdApiComponents
import org.http4s.Uri
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import utils.IdentityApiThreadPoolMonitor

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
  lazy val identityAuthService: IdentityPlayAuthService = {
    val blockingThreads = 30

    val threadPool = Executors.newFixedThreadPool(blockingThreads).asInstanceOf[ThreadPoolExecutor]
    IdentityApiThreadPoolMonitor.monitorThreadPool(threadPool)

    val ec: ExecutionContext = ExecutionContext.fromExecutorService(threadPool)

    IdentityPlayAuthService.unsafeInit(
      Uri.unsafeFromString(identityConfiguration.apiRoot),
      identityConfiguration.apiClientToken,
      None
    )(ec)
  }
  lazy val identityCookieService: IdentityCookieService =  IdentityCookieService.fromKeyPair(identityKeys.publicDsaKey, None)
  lazy val authenticationService = wire[AuthenticationService]
  lazy val torNodeLoggingIdRequestParser = wire[TorNodeLoggingIdRequestParser]
  lazy val emailService = wire[NewsletterService]
  lazy val mdapiService = wire[MembersDataApiService]
  lazy val discussionApiService = wire[DiscussionApiService]
}

package services

import java.util.concurrent.{Executors, ThreadPoolExecutor}
import clients.DiscussionClient
import com.gu.identity.cookie.IdentityCookieService
import com.gu.identity.play.IdentityPlayAuthService
import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import idapiclient.IdApiComponents
import org.http4s.Uri
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.newsletters.{NewsletterSignupAgent, NewsletterApi}
import utils.IdentityApiThreadPoolMonitor

import scala.concurrent.ExecutionContext

trait IdentityServices extends IdentityConfigurationComponents with IdApiComponents {
  def wsClient: WSClient
  def controllerComponents: ControllerComponents
  implicit val executionContext: ExecutionContext

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient: ContentApiClient = wire[ContentApiClient]

  lazy val returnUrlVerifier: ReturnUrlVerifier = wire[ReturnUrlVerifier]
  lazy val idRequestParser: IdRequestParser = wire[IdRequestParser]
  lazy val identityUrlBuilder: IdentityUrlBuilder = wire[IdentityUrlBuilder]
  lazy val playSigninService: PlaySigninService = wire[PlaySigninService]
  lazy val identityAuthService: IdentityPlayAuthService = {
    val blockingThreads = 30

    val threadPool = Executors.newFixedThreadPool(blockingThreads).asInstanceOf[ThreadPoolExecutor]
    IdentityApiThreadPoolMonitor.monitorThreadPool(threadPool)

    val ec: ExecutionContext = ExecutionContext.fromExecutorService(threadPool)

    IdentityPlayAuthService.unsafeInit(
      Uri.unsafeFromString(identityConfiguration.apiRoot),
      identityConfiguration.apiClientToken,
      None,
    )(ec)
  }
  lazy val identityCookieService: IdentityCookieService =
    IdentityCookieService.fromKeyPair(identityKeys.publicDsaKey, None)
  lazy val authenticationService: AuthenticationService = wire[AuthenticationService]
  lazy val torNodeLoggingIdRequestParser: TorNodeLoggingIdRequestParser = wire[TorNodeLoggingIdRequestParser]
  lazy val emailService: NewsletterService = wire[NewsletterService]
  lazy val mdapiService: MembersDataApiService = wire[MembersDataApiService]
  lazy val discussionApiService: DiscussionApiService = wire[DiscussionApiService]
  lazy val discussionClient: DiscussionClient = wire[DiscussionClient]
  lazy val newsletterApi: NewsletterApi = wire[NewsletterApi]
  lazy val newsletterSignupAgent: NewsletterSignupAgent = wire[NewsletterSignupAgent]
}

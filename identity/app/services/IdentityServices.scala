package services

import com.softwaremill.macwire._
import conf.IdentityConfigurationComponents
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import idapiclient.IdApiComponents
import model.SaveForLaterDataBuilder
import play.api.libs.ws.WSClient
import discussion.api.DiscussionApi

trait IdentityServices extends IdentityConfigurationComponents with IdApiComponents {

  def wsClient: WSClient
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val discussionApi = wire[DiscussionApi]

  lazy val returnUrlVerifier = wire[ReturnUrlVerifier]
  lazy val idRequestParser = wire[IdRequestParser]
  lazy val identityUrlBuilder = wire[IdentityUrlBuilder]
  lazy val playSigninService = wire[PlaySigninService]
  lazy val authenticationService = wire[AuthenticationService]
  lazy val userCreationService = wire[UserCreationService]
  lazy val torNodeLoggingIdRequestParser = wire[TorNodeLoggingIdRequestParser]
  lazy val playSavedArticlesService = wire[PlaySavedArticlesService]
  lazy val saveforLaterDataBuilder = wire[SaveForLaterDataBuilder]
}

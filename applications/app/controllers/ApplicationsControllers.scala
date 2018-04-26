package controllers

import com.softwaremill.macwire._
import contentapi.{ContentApiClient, SectionsLookUp}
import jobs.SiteMapJob
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.FacebookGraphApi

trait ApplicationsControllers {

  def contentApiClient: ContentApiClient
  def siteMapJob: SiteMapJob
  def sectionsLookUp: SectionsLookUp
  def wsClient: WSClient
  def facebookGraphApi: FacebookGraphApi
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext

  lazy val siteMapController = wire[SiteMapController]
  lazy val crosswordPageController = wire[CrosswordPageController]
  lazy val crosswordSearchController = wire[CrosswordSearchController]
  lazy val tagIndexController = wire[TagIndexController]
  lazy val embedController = wire[EmbedController]
  lazy val AtomPageController = wire[AtomPageController]
  lazy val preferencesController = wire[PreferencesController]
  lazy val optInController = wire[OptInController]
  lazy val webAppController = wire[WebAppController]
  lazy val newspaperController = wire[NewspaperController]
  lazy val quizController = wire[QuizController]
  lazy val allIndexController = wire[AllIndexController]
  lazy val latestIndexController = wire[LatestIndexController]
  lazy val galleryController = wire[GalleryController]
  lazy val imageContentController = wire[ImageContentController]
  lazy val mediaController = wire[MediaController]
  lazy val interactiveController = wire[InteractiveController]
  lazy val shortUrlsController = wire[ShortUrlsController]
  lazy val indexController = wire[IndexController]
  lazy val siteVerificationController = wire[SiteVerificationController]
  lazy val shareCountController = wire[ShareCountController]
  lazy val formstackController = wire[CampaignsController]

  //A fake geolocation controller to test it locally
  lazy val geolocationController = wire[FakeGeolocationController]
}

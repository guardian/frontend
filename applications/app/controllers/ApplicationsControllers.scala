package controllers

import com.softwaremill.macwire._
import contentapi.{ContentApiClient, SectionsLookUp}
import jobs.SiteMapJob
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import renderers.DotcomRenderingService

trait ApplicationsControllers {

  def contentApiClient: ContentApiClient
  def siteMapJob: SiteMapJob
  def sectionsLookUp: SectionsLookUp
  def wsClient: WSClient
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext

  lazy val remoteRender: DotcomRenderingService = wire[renderers.DotcomRenderingService]
  lazy val siteMapController: SiteMapController = wire[SiteMapController]
  lazy val crosswordPageController: CrosswordPageController = wire[CrosswordPageController]
  lazy val crosswordSearchController: CrosswordSearchController = wire[CrosswordSearchController]
  lazy val tagIndexController: TagIndexController = wire[TagIndexController]
  lazy val embedController: EmbedController = wire[EmbedController]
  lazy val AtomPageController: AtomPageController = wire[AtomPageController]
  lazy val preferencesController: PreferencesController = wire[PreferencesController]
  lazy val optInController: OptInController = wire[OptInController]
  lazy val newspaperController: NewspaperController = wire[NewspaperController]
  lazy val quizController: QuizController = wire[QuizController]
  lazy val allIndexController: AllIndexController = wire[AllIndexController]
  lazy val latestIndexController: LatestIndexController = wire[LatestIndexController]
  lazy val galleryController: GalleryController = wire[GalleryController]
  lazy val imageContentController: ImageContentController = wire[ImageContentController]
  lazy val mediaController: MediaController = wire[MediaController]
  lazy val interactiveController: InteractiveController = wire[InteractiveController]
  lazy val shortUrlsController: ShortUrlsController = wire[ShortUrlsController]
  lazy val indexController: IndexController = wire[IndexController]
  lazy val siteVerificationController: SiteVerificationController = wire[SiteVerificationController]
  lazy val youtubeController: YoutubeController = wire[YoutubeController]
  lazy val nx1ConfigController: Nx1ConfigController = wire[Nx1ConfigController]

  // A fake geolocation controller to test it locally
  lazy val geolocationController: FakeGeolocationController = wire[FakeGeolocationController]
}

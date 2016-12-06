package controllers

import com.softwaremill.macwire._
import contentapi.{ContentApiClient, SectionsLookUp}
import jobs.SiteMapJob
import play.api.Environment
import play.api.libs.ws.WSClient

trait ApplicationsControllers {

  def contentApiClient: ContentApiClient
  def siteMapJob: SiteMapJob
  def sectionsLookUp: SectionsLookUp
  def wsClient: WSClient
  implicit def environment: Environment

  lazy val siteMapController = wire[SiteMapController]
  lazy val crosswordPageController = wire[CrosswordPageController]
  lazy val crosswordSearchController = wire[CrosswordSearchController]
  lazy val notificationsController = wire[NotificationsController]
  lazy val tagIndexController = wire[TagIndexController]
  lazy val embedController = wire[EmbedController]
  lazy val mediaAtomEmbedController = wire[MediaAtomEmbedController]
  lazy val preferencesController = wire[PreferencesController]
  lazy val optInController = wire[OptInController]
  lazy val webAppController = wire[WebAppController]
  lazy val newspaperController = wire[NewspaperController]
  lazy val quizController = wire[QuizController]
  lazy val allIndexController = wire[AllIndexController]
  lazy val latestIndexController = wire[LatestIndexController]
  lazy val sudokuController = wire[SudokusController]
  lazy val galleryController = wire[GalleryController]
  lazy val imageContentController = wire[ImageContentController]
  lazy val mediaController = wire[MediaController]
  lazy val interactiveController = wire[InteractiveController]
  lazy val shortUrlsController = wire[ShortUrlsController]
  lazy val indexController = wire[IndexController]
  lazy val siteVerificationController = wire[SiteVerificationController]
}

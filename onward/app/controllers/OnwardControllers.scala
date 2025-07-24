package controllers

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import com.softwaremill.macwire._
import business.StocksData
import contentapi.ContentApiClient
import feed._
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import agents.DeeplyReadAgent
import renderers.DotcomRenderingService
import services.PopularInTagService

trait OnwardControllers {

  implicit def appContext: ApplicationContext
  def wsClient: WSClient
  def contentApiClient: ContentApiClient
  def stocksData: StocksData
  def geoMostPopularAgent: GeoMostPopularAgent
  def dayMostPopularAgent: DayMostPopularAgent
  def mostPopularAgent: MostPopularAgent
  def deeplyReadAgent: DeeplyReadAgent
  def mostReadAgent: MostReadAgent
  def mostViewedVideoAgent: MostViewedVideoAgent
  def mostViewedGalleryAgent: MostViewedGalleryAgent
  def mostViewedAudioAgent: MostViewedAudioAgent
  def pekkoActorSystem: PekkoActorSystem
  def controllerComponents: ControllerComponents
  def remoteRenderer: DotcomRenderingService
  def popularInTagService: PopularInTagService

  lazy val navigationController = wire[NavigationController]
  lazy val mostPopularController = wire[MostPopularController]
  lazy val topStoriesController = wire[TopStoriesController]
  lazy val relatedController = wire[RelatedController]
  lazy val popularInTag = wire[PopularInTag]
  lazy val changeEditionController = wire[ChangeEditionController]
  lazy val mediaInSectionController = wire[MediaInSectionController]
  lazy val mostViewedVideoController = wire[MostViewedVideoController]
  lazy val mostViewedAudioController = wire[MostViewedAudioController]
  lazy val mostViewedGalleryController = wire[MostViewedGalleryController]
  lazy val richLinkController = wire[RichLinkController]
  lazy val recommendedContentCardController = wire[RecommendedContentCardController]
  lazy val cardController = wire[CardController]
  lazy val taggedContentController = wire[TaggedContentController]
  lazy val seriesController = wire[SeriesController]
  lazy val stocksController = wire[StocksController]
  lazy val storyPackageController = wire[StoryPackageController]
}

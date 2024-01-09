package controllers

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import com.softwaremill.macwire._
import weather.controllers.{LocationsController, WeatherController}
import business.StocksData
import contentapi.ContentApiClient
import feed._
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import weather.WeatherApi
import agents.DeeplyReadAgent
import renderers.DotcomRenderingService
import services.PopularInTagService

trait OnwardControllers {

  implicit def appContext: ApplicationContext
  def wsClient: WSClient
  def contentApiClient: ContentApiClient
  def stocksData: StocksData
  def weatherApi: WeatherApi
  def geoMostPopularAgent: GeoMostPopularAgent
  def dayMostPopularAgent: DayMostPopularAgent
  def mostPopularAgent: MostPopularAgent
  def deeplyReadAgent: DeeplyReadAgent
  def mostReadAgent: MostReadAgent
  def mostPopularSocialAutoRefresh: MostPopularSocialAutoRefresh
  def mostViewedVideoAgent: MostViewedVideoAgent
  def mostViewedGalleryAgent: MostViewedGalleryAgent
  def mostViewedAudioAgent: MostViewedAudioAgent
  def pekkoActorSystem: PekkoActorSystem
  def controllerComponents: ControllerComponents
  def remoteRenderer: DotcomRenderingService
  def popularInTagService: PopularInTagService

  lazy val navigationController: NavigationController = wire[NavigationController]
  lazy val weatherController: WeatherController = wire[WeatherController]
  lazy val locationsController: LocationsController = wire[LocationsController]
  lazy val mostViewedSocialController: MostViewedSocialController = wire[MostViewedSocialController]
  lazy val mostPopularController: MostPopularController = wire[MostPopularController]
  lazy val topStoriesController: TopStoriesController = wire[TopStoriesController]
  lazy val relatedController: RelatedController = wire[RelatedController]
  lazy val popularInTag: PopularInTag = wire[PopularInTag]
  lazy val changeEditionController: ChangeEditionController = wire[ChangeEditionController]
  lazy val mediaInSectionController: MediaInSectionController = wire[MediaInSectionController]
  lazy val mostViewedVideoController: MostViewedVideoController = wire[MostViewedVideoController]
  lazy val mostViewedAudioController: MostViewedAudioController = wire[MostViewedAudioController]
  lazy val mostViewedGalleryController: MostViewedGalleryController = wire[MostViewedGalleryController]
  lazy val richLinkController: RichLinkController = wire[RichLinkController]
  lazy val recommendedContentCardController: RecommendedContentCardController = wire[RecommendedContentCardController]
  lazy val cardController: CardController = wire[CardController]
  lazy val taggedContentController: TaggedContentController = wire[TaggedContentController]
  lazy val seriesController: SeriesController = wire[SeriesController]
  lazy val stocksController: StocksController = wire[StocksController]
  lazy val storyPackageController: StoryPackageController = wire[StoryPackageController]
}

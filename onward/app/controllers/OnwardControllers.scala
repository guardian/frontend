package controllers

import com.softwaremill.macwire._
import weather.controllers.{LocationsController, WeatherController}
import business.StocksData
import contentapi.ContentApiClient
import feed._
import model.ApplicationContext
import play.api.libs.ws.WSClient
import weather.WeatherApi

trait OnwardControllers {

  implicit def appContext: ApplicationContext
  def wsClient: WSClient
  def contentApiClient: ContentApiClient
  def stocksData: StocksData
  def weatherApi: WeatherApi
  def geoMostPopularAgent: GeoMostPopularAgent
  def dayMostPopularAgent: DayMostPopularAgent
  def mostPopularAgent: MostPopularAgent
  def mostReadAgent: MostReadAgent
  def mostPopularSocialAutoRefresh: MostPopularSocialAutoRefresh
  def mostViewedVideoAgent: MostViewedVideoAgent
  def mostViewedGalleryAgent: MostViewedGalleryAgent
  def mostViewedAudioAgent: MostViewedAudioAgent

  lazy val navigationController = wire[NavigationController]
  lazy val weatherController = wire[WeatherController]
  lazy val locationsController = wire[LocationsController]
  lazy val mostViewedSocialController = wire[MostViewedSocialController]
  lazy val mostPopularController = wire[MostPopularController]
  lazy val topStoriesController = wire[TopStoriesController]
  lazy val relatedController = wire[RelatedController]
  lazy val popularInTag = wire[PopularInTag]
  lazy val changeEditionController = wire[ChangeEditionController]
  lazy val changeAlphaController = wire[ChangeAlphaController]
  lazy val mediaInSectionController = wire[MediaInSectionController]
  lazy val mostViewedVideoController = wire[MostViewedVideoController]
  lazy val mostViewedAudioController = wire[MostViewedAudioController]
  lazy val mostViewedGalleryController = wire[MostViewedGalleryController]
  lazy val videoEndSlateController = wire[VideoEndSlateController]
  lazy val richLinkController = wire[RichLinkController]
  lazy val recommendedContentCardController = wire[RecommendedContentCardController]
  lazy val cardController = wire[CardController]
  lazy val taggedContentController = wire[TaggedContentController]
  lazy val seriesController = wire[SeriesController]
  lazy val stocksController = wire[StocksController]
  lazy val techFeedbackController = wire[TechFeedbackController]
  lazy val geoLocationController = wire[GeoLocationController]
}

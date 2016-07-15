package controllers

import com.softwaremill.macwire._
import weather.controllers.{LocationsController, WeatherController}

trait OnwardControllers {
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
  lazy val cardController = wire[CardController]
  lazy val taggedContentController = wire[TaggedContentController]
  lazy val seriesController = wire[SeriesController]
  lazy val stocksController = wire[StocksController]
  lazy val techFeedbackController = wire[TechFeedbackController]
}

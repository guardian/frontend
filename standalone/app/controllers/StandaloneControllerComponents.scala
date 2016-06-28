package controllers

import com.softwaremill.macwire._
import controllers.commercial._
import dev.DevAssetsController
import football.controllers._
import play.api.BuiltInComponents
import rugby.controllers.MatchesController
import weather.controllers.{WeatherController, LocationsController}

trait StandaloneControllerComponents {
  self: BuiltInComponents =>

  lazy val allIndexController = wire[AllIndexController]
  lazy val articleController = wire[ArticleController]
  lazy val assets = wire[Assets]
  lazy val bookOffersController = wire[BookOffersController]
  lazy val cardController = wire[CardController]
  lazy val changeAlphaController = wire[ChangeAlphaController]
  lazy val changeEditionController = wire[ChangeEditionController]
  lazy val competitionListController = wire[CompetitionListController]
  lazy val cricketMatchController = wire[CricketMatchController]
  lazy val crosswordPageController = wire[CrosswordPageController]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val faciaController = wire[FaciaControllerImpl]
  lazy val faciaDraftController: FaciaDraftController = wire[FaciaDraftController]
  lazy val faviconController = wire[FaviconController]
  lazy val fixturesController = wire[FixturesController]
  lazy val galleryController = wire[GalleryController]
  lazy val imageContentController = wire[ImageContentController]
  lazy val indexController = wire[IndexController]
  lazy val interactiveController = wire[InteractiveController]
  lazy val itemController = wire[ItemController]
  lazy val jobsController = wire[JobsController]
  lazy val latestIndexController = wire[LatestIndexController]
  lazy val leagueTableController = wire[LeagueTableController]
  lazy val locationsController = wire[LocationsController]
  lazy val masterclassesController = wire[MasterclassesController]
  lazy val matchController = wire[MatchController]
  lazy val matchDayController = wire[MatchDayController]
  lazy val matchesController = wire[MatchesController]
  lazy val mediaController = wire[MediaController]
  lazy val mediaInSectionController = wire[MediaInSectionController]
  lazy val moneyOffers = wire[MoneyOffers]
  lazy val moreOnMatchController = wire[MoreOnMatchController]
  lazy val mostPopularController = wire[MostPopularController]
  lazy val mostViewedAudioController = wire[MostViewedAudioController]
  lazy val mostViewedVideoController = wire[MostViewedVideoController]
  lazy val newsAlertController = wire[NewsAlertControllerImpl]
  lazy val newspaperController = wire[NewspaperController]
  lazy val oAuthLoginController = wire[OAuthLoginController]
  lazy val popularInTag = wire[PopularInTag]
  lazy val quizController = wire[QuizController]
  lazy val relatedController = wire[RelatedController]
  lazy val resultsController = wire[ResultsController]
  lazy val richLinkController = wire[RichLinkController]
  lazy val seriesController = wire[SeriesController]
  lazy val soulmatesController = wire[SoulmatesController]
  lazy val taggedContentController = wire[TaggedContentController]
  lazy val topStoriesController = wire[TopStoriesController]
  lazy val travelOffersController = wire[TravelOffersController]
  lazy val wallchartController = wire[WallchartController]
  lazy val weatherController = wire[WeatherController]

}

package controllers

import com.softwaremill.macwire._
import contentapi.ContentApiClient
import feed._
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.{NewspaperBookSectionTagAgent, NewspaperBookTagAgent, OphanApi}

import scala.concurrent.ExecutionContext

trait ArticleControllers {
  def contentApiClient: ContentApiClient
  def controllerComponents: ControllerComponents
  def wsClient: WSClient
  implicit def appContext: ApplicationContext

  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
  lazy val articleController = wire[ArticleController]
  lazy val liveBlogController = wire[LiveBlogController]

  // Tmp for test
  implicit val executionContext: ExecutionContext
  lazy val ophanApi = wire[OphanApi]
  lazy val mostCommentedAgent = wire[MostCommentedAgent]
  lazy val onSocialAgent = wire[OnSocialAgent]
  lazy val geoMostPopularAgent = wire[GeoMostPopularAgent]
  lazy val dayMostPopularAgent = wire[DayMostPopularAgent]
  lazy val mostPopularAgent = wire[MostPopularAgent]
  lazy val mostPopularController = wire[MostPopularController]
}

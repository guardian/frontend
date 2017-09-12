package controllers

import com.softwaremill.macwire._
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.mvc.ControllerComponents
import services.{NewspaperBookSectionTagAgent, NewspaperBookTagAgent}

trait ArticleControllers {
  def contentApiClient: ContentApiClient
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
  lazy val articleController = wire[ArticleController]
}

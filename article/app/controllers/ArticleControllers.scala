package controllers

import com.softwaremill.macwire._
import contentapi.ContentApiClient
import play.api.BuiltInComponents
import services.{NewspaperBookSectionTagAgent, NewspaperBookTagAgent}

trait ArticleControllers {
  self: BuiltInComponents =>
  def contentApiClient: ContentApiClient
  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
  lazy val articleController = wire[ArticleController]
}

package controllers

import agents.CuratedContentAgent
import com.softwaremill.macwire._
import contentapi.ContentApiClient
import model.{ApplicationContext, TopicsApiResponse}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import renderers.DotcomRenderingService
import services.{NewsletterService, NewspaperBookSectionTagAgent, NewspaperBookTagAgent, S3Client}
import services.newsletters.NewsletterSignupAgent
import topics.{TopicService}

trait ArticleControllers {
  def contentApiClient: ContentApiClient
  def controllerComponents: ControllerComponents
  def wsClient: WSClient
  def remoteRender: DotcomRenderingService
  def topicS3Client: S3Client[TopicsApiResponse]
  def topicService: TopicService
  def newsletterSignupAgent: NewsletterSignupAgent
  def curatedContentAgent: CuratedContentAgent

  implicit def appContext: ApplicationContext
  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
  lazy val articleController = wire[ArticleController]
  lazy val liveBlogController = wire[LiveBlogController]
  lazy val newsletterService = wire[NewsletterService]
}

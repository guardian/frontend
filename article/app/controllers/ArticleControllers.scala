package controllers

import agents.DeeplyReadAgent
import com.softwaremill.macwire._
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import renderers.DotcomRenderingService
import services.{NewsletterService, NewspaperBookSectionTagAgent, NewspaperBookTagAgent}
import services.newsletters.NewsletterSignupAgent
import topics.{TopicS3Client, TopicService}

trait ArticleControllers {
  def contentApiClient: ContentApiClient
  def controllerComponents: ControllerComponents
  def wsClient: WSClient
  def remoteRender: DotcomRenderingService
  def topicS3Client: TopicS3Client
  def topicService: TopicService
  def newsletterSignupAgent: NewsletterSignupAgent

  implicit def appContext: ApplicationContext
  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
  lazy val articleController = wire[ArticleController]
  lazy val liveBlogController = wire[LiveBlogController]
  lazy val newsletterService = wire[NewsletterService]
  lazy val deeplyReadAgent = wire[DeeplyReadAgent]
}

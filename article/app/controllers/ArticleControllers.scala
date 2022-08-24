package controllers

import akka.actor.ActorSystem
import agents.CuratedContentAgent
import com.softwaremill.macwire._
import concurrent.BlockingOperations
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import renderers.DotcomRenderingService
import services.fronts.FrontJsonFapiLive
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

  def actorSystem: ActorSystem
  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
  lazy val articleController = wire[ArticleController]
  lazy val curatedContentAgent = wire[CuratedContentAgent]
  lazy val FrontsJsonFapi = wire[FrontJsonFapiLive]
  lazy val liveBlogController = wire[LiveBlogController]
  lazy val newsletterService = wire[NewsletterService]
  lazy val articleBlockingOperations = wire[BlockingOperations]
}

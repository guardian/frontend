package controllers

import play.api.Play._
import discussion.DiscussionApi
import play.api.{Plugin, Application}
import conf.Configuration
import scala.concurrent.Future
import play.api.libs.ws.{WS, Response}


trait DiscussionDispatcher extends CommentCountController with CommentPageController

object DiscussionApp extends DiscussionDispatcher {
  protected val discussionApi = current.plugin(classOf[DiscussionApi]) getOrElse {
    throw new RuntimeException("No Discussion Api defined!")
  }
}

class DiscussionApiPlugin(app: Application) extends DiscussionApi with Plugin{
  protected val apiRoot =   Configuration.discussion.apiRoot

  protected def GET(url: String): Future[Response] = WS.url(url).withTimeout(2000).get()

}

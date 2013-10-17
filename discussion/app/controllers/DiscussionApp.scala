package controllers

import play.api.Play._
import discussion.{DiscussionHeaders, DiscussionApi}
import play.api.{Plugin, Application}
import conf.Configuration
import scala.concurrent.Future
import play.api.libs.ws.{WS, Response}


trait DiscussionDispatcher
  extends CommentCountController
  with CommentPageController
  with CommentBoxController

object DiscussionApp extends DiscussionDispatcher {
  protected val discussionApi = current.plugin(classOf[DiscussionApi]) getOrElse {
    throw new RuntimeException("No Discussion Api defined!")
  }
}

class DiscussionApiPlugin(app: Application) extends DiscussionApi with Plugin{
  protected val apiRoot =   Configuration.discussion.apiRoot
  private val guClientHeader: (String, String) = (DiscussionHeaders.guClient, Configuration.discussion.apiClientHeader)

  protected def GET(url: String, headers: (String, String)*): Future[Response] =
      WS.url(url)
        .withHeaders(headers: _*)
        .withHeaders(guClientHeader)
        .withRequestTimeout(2000).get()  //TODO put in properties file
}

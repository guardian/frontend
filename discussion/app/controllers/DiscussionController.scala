package controllers

import conf.Configuration
import play.api.{Plugin, Application}
import play.api.Play._
import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import discussion.DiscussionApi

class DiscussionApiPlugin(app: Application) extends DiscussionApi with Plugin {
  protected val apiRoot = Configuration.discussion.apiRoot
  override protected val clientHeaderValue: String = Configuration.discussion.apiClientHeader
}

trait DiscussionController
  extends Controller
  with Logging
  with ExecutionContexts
  with implicits.Requests{

  protected lazy val discussionApi: DiscussionApi = current.plugin(classOf[DiscussionApi]) getOrElse {
    throw new RuntimeException("No Discussion Api defined!")
  }
}

package controllers

import conf.Configuration
import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import discussion.DiscussionApi

object delegate {
  // var allows us to inject test api
  var api = new DiscussionApi {
    override protected val apiRoot = Configuration.discussion.apiRoot
    override protected val clientHeaderValue: String = Configuration.discussion.apiClientHeader
  }

}

trait DiscussionController
  extends Controller
  with Logging
  with ExecutionContexts
  with implicits.Requests{

  protected lazy val discussionApi = delegate.api
}

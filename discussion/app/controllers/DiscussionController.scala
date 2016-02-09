package controllers

import conf.Configuration
import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import discussion.DiscussionApi

object delegate {
  // var allows us to inject test api
  var api = new DiscussionApi {

    override protected val apiRoot =
      if (Configuration.environment.isProd)
        Configuration.discussion.apiRoot
      else
        Configuration.discussion.apiRoot.replaceFirst("https://", "http://") // CODE SSL cert is defective and expensive to fix

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

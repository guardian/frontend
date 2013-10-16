package controllers

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import discussion.DiscussionApi

trait DiscussionController
  extends Controller
  with Logging
  with ExecutionContexts
  with implicits.Requests{

  protected val discussionApi: DiscussionApi
}

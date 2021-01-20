package controllers

import play.api.mvc.BaseController
import common.{ImplicitControllerExecutionContext, GuLogging}
import discussion.api.DiscussionApiLike

trait DiscussionController
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with implicits.Requests {

  val discussionApi: DiscussionApiLike
}

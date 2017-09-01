package controllers

import play.api.mvc._
import model.Cached
import common.{ImplicitControllerExecutionContext, JsonComponent}
import discussion.model._
import discussion.api.WitnessApi
import discussion.api.DiscussionApiException._
import conf.Configuration
import play.api.libs.ws.WSClient

trait WitnessActivityController extends WitnessApi with BaseController with ImplicitControllerExecutionContext with implicits.Requests {

  def witnessActivity(userId: String): Action[AnyContent] = Action.async {
    implicit request => {
      def renderWitnessActivityJson = (contributions: List[WitnessActivity]) => Cached(60)(JsonComponent(views.html.profileActivity.witnessActivity(contributions)))
      getWitnessActivity(userId) map renderWitnessActivityJson recover toResult
    }
  }
}

class WitnessActivityControllerImpl(val wsClient: WSClient, val controllerComponents: ControllerComponents) extends WitnessActivityController {
  protected lazy val witnessApiRoot: String = Configuration.witness.witnessApiRoot
}

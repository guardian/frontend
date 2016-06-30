package controllers

import play.api.mvc.{Controller, AnyContent, Action}
import model.Cached
import common.{ExecutionContexts, JsonComponent}
import discussion.model._
import discussion.api.WitnessApi
import conf.Configuration

trait WitnessActivityController extends WitnessApi with Controller with ExecutionContexts with implicits.Requests {

  def witnessActivity(userId: String): Action[AnyContent] = Action.async {
    implicit request => {
      def renderWitnessActivityJson = (contributions: List[WitnessActivity]) => Cached(60)(JsonComponent("html" -> views.html.profileActivity.witnessActivity(contributions)))
      getWitnessActivity(userId) map renderWitnessActivityJson
    }
  }
}

class WitnessActivityControllerImpl extends WitnessActivityController {
  protected val witnessApiRoot: String = Configuration.witness.witnessApiRoot
}

object WitnessActivityController extends WitnessActivityControllerImpl

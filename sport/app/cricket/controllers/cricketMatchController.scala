package controllers

import common.{Logging, ExecutionContexts}
import play.api.mvc.{Action, Controller}

object CricketMatchController extends Controller with Logging with ExecutionContexts {

  // We don't have rights to the PA cricket feed.
  def renderMatchId(matchId: String) =  Action { MovedPermanently("/sport/cricket") }
}

package controllers

import play.api.mvc._
import common.ExecutionContexts
import model.travel.service.OffersAgent

object Application extends Controller with ExecutionContexts {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def test = Action {
    implicit request =>
      Ok(OffersAgent.allOffers mkString "\n")
  }

  // TODO: schedule agent
  def refreshAllOffers = Action {
    implicit request =>
      OffersAgent.refresh()
      Ok("OK")
  }

}

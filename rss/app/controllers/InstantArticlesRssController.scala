package controllers

import common.ExecutionContexts
import instant.InstantArticlesRss
import model._
import play.api.mvc.{Action, Controller}

object InstantArticlesRssController extends Controller with ExecutionContexts {
  def renderInstantArticles() = Action.async{ implicit request =>
    InstantArticlesRss().map{ body =>
      Cached(60)(Ok(body).as("text/xml; charset=utf-8"))
    }
  }
}

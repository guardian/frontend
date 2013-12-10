package controllers.admin

import common.{ ExecutionContexts, Logging }
import common.AdminMetrics.{ ConfigUpdateCounter, ConfigUpdateErrorCounter }
import conf.Configuration
import controllers.AuthLogging
import play.api.mvc._
import play.api.libs.json.{JsValue, Json}
import play.api.libs.json.Json.toJson
import tools.Store
import scala.concurrent.Future
import model.NoCache

object FeatureTrailblockController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def edit() = Authenticated.async { request =>
    log("loaded config", request)
    Future(Store.getConfig getOrElse "{}") map { config =>
      NoCache(Ok(views.html.edit(config, Configuration.environment.stage)))
    }
  }

  def save() = Authenticated.async { request =>
    log("saved config", request)
    request.body.asJson map { saveConfigOrError } getOrElse {
      Future(NoCache(BadRequest(toJson(Map("status" -> "Invalid Json")))))
    }
  }

  private def saveConfigOrError(json: JsValue): Future[SimpleResult] = Future {
    try {
      Store.putConfig(Json.stringify(json))
      log.info("config successfully updated")
      ConfigUpdateCounter.recordCount(1)
      NoCache(Ok(toJson(Map("status" -> "Configuration updated"))))
    } catch { case e: Throwable =>
      log.error("exception saving config", e)
      ConfigUpdateErrorCounter.recordCount(1)
      NoCache(InternalServerError(toJson(Map("status" -> e.getMessage))))
    }
  }
}

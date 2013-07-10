package controllers

import common.{ ExecutionContexts, Logging }
import common.AdminMetrics.{ ConfigUpdateCounter, ConfigUpdateErrorCounter }
import conf.Configuration
import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json.{JsValue, Json}
import play.api.libs.json.Json.toJson
import tools.Store

object FeatureTrailblockController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def edit() = AuthAction{ request =>
    log("loaded config", request)
    val promiseOfConfig = Akka.future(Store.getConfig)

    Async{
      promiseOfConfig.map(config => Ok(views.html.edit(config.getOrElse("{}"), Configuration.environment.stage)))
    }
  }

  def save() = AuthAction{ request =>
    log("saved config", request)
    request.body.asJson match {
      case Some(json) =>
        val promiseOfSavedConfig = Akka.future{ saveConfigOrError(json) }
        Async{ promiseOfSavedConfig.map( result => result) }
      case None => BadRequest(toJson(Map("status" -> "Invalid Json")))
    }
  }

  private def saveConfigOrError(json: JsValue) = try {
    Store.putConfig(Json.stringify(json))
    log.info("config successfully updated")
    ConfigUpdateCounter.recordCount(1)
    Ok(toJson(Map("status" -> "Configuration updated")))
  } catch { case e: Throwable =>
      log.error("exception saving config", e)
      ConfigUpdateErrorCounter.recordCount(1)
      InternalServerError(toJson(Map("status" -> e.getMessage)))
  }
}

package controllers.admin

import common.{ImplicitControllerExecutionContext, Logging}
import conf.Configuration
import layout.DedupedFrontResult
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, NoCache}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.WSClient
import play.api.mvc.{BaseController, ControllerComponents}
import services.ConfigAgent

class WhatIsDeduped(
  wsClient: WSClient,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Logging with ImplicitControllerExecutionContext {

   def index() = Action { implicit request =>
     val paths: List[String] = ConfigAgent.getPathIds.sorted
     Cached(60)(RevalidatableResult.Ok(views.html.dedupePathsList(paths)))
   }

   def dedupedFor(path: String) = Action.async { implicit request =>
     val domain = Configuration.ajax.url
     val url = s"$domain/$path/deduped.json"
     wsClient.url(url).get().map { response =>
       response.json.validate[DedupedFrontResult] match {
         case JsSuccess(dedupedFrontResult, _) =>
           Cached(60)(RevalidatableResult.Ok(views.html.dedupedOnPath(dedupedFrontResult)))
         case JsError(errors) => NoCache(NotFound(s"$path Not Found"))
       }
     }.recover {
       case t: Throwable =>
         log.error(s"Error with deduped request: $t")
         InternalServerError(s"Something went wrong with request to: $url")
     }
   }

 }

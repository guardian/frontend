package controllers.admin

import common.{ExecutionContexts, Logging}
import conf.Configuration
import layout.DedupedFrontResult
import model.Cached.RevalidatableResult
import model.{NoCache, Cached}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.WSClient
import play.api.mvc.Controller
import services.ConfigAgent

class WhatIsDeduped(wsClient: WSClient) extends Controller with Logging with ExecutionContexts {

   def index() = AuthActions.AuthActionTest { implicit request =>
     val paths: List[String] = ConfigAgent.getPathIds.sorted
     Cached(60)(RevalidatableResult.Ok(views.html.dedupePathsList(Configuration.environment.stage, paths)))
   }

   def dedupedFor(path: String) = AuthActions.AuthActionTest.async { implicit request =>
     val domain = Configuration.ajax.url
     val url = s"$domain/$path/deduped.json"
     wsClient.url(url).get().map { response =>
       response.json.validate[DedupedFrontResult] match {
         case JsSuccess(dedupedFrontResult, _) =>
           Cached(60)(RevalidatableResult.Ok(views.html.dedupedOnPath(Configuration.environment.stage, dedupedFrontResult)))
         case JsError(errors) => NoCache(NotFound(s"$path Not Found"))
       }
     }.recover {
       case t: Throwable =>
         log.error(s"Error with deduped request: $t")
         InternalServerError(s"Something went wrong with request to: $url")
     }
   }

 }

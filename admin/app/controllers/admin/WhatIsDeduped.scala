package controllers.admin

import common.{ExecutionContexts, Logging}
import conf.Configuration
import layout.DedupedFrontResult
import model.{NoCache, Cached}
import play.Play
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.WS
import play.api.mvc.Controller
import services.ConfigAgent

object WhatIsDeduped extends Controller with Logging with ExecutionContexts {

 import play.api.Play.current

   def index() = AuthActions.AuthActionTest { request =>
     val paths: List[String] = ConfigAgent.getPathIds.sorted
     Cached(60)(Ok(views.html.dedupePathsList(Configuration.environment.stage, paths)))
   }

   def dedupedFor(path: String) = AuthActions.AuthActionTest.async {
     val domain = if (Play.isDev) "http://localhost:9000" else Configuration.ajax.url
     val url = s"$domain/$path/deduped.json"
     WS.url(url).get().map { response =>
       response.json.validate[DedupedFrontResult] match {
         case JsSuccess(dedupedFrontResult, _) =>
           Cached(60)(Ok(views.html.dedupedOnPath(Configuration.environment.stage, dedupedFrontResult)))
         case JsError(errors) => NoCache(NotFound(s"$path Not Found"))
       }
     }.recover {
       case t: Throwable =>
         log.error(s"Error with deduped request: $t")
         InternalServerError(s"Something went wrong with request to: $url")
     }
   }

 }

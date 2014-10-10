package controllers

import com.github.nscala_time.time.Imports._
import common.{Edition, ExecutionContexts}
import conf.LiveContentApi
import implicits.{Dates, Requests}
import model.NoCache
import play.api.libs.json.Json._
import play.api.mvc.{Action, Controller, RequestHeader, Results}

import scala.concurrent.Future
import scala.concurrent.Future.successful

object LastModifiedController extends Controller with ExecutionContexts with Requests with Dates with Results {

  private val fresh = Ok(obj("status" -> "fresh"))
  private val stale = Ok(obj("status" -> "stale"))

  def render(path: String) = Action.async{ implicit request =>
    val dateParam = request.getParameter("last-modified").map(_.parseISODateTime)
    dateParam.map{ expectedDate =>
      lastModified(path).map{ _.map{ actualDate =>
        NoCache(if (actualDate >= expectedDate) fresh else stale)
      }.getOrElse(NoCache(NotFound))}
    }.getOrElse(successful(NoCache(BadRequest("No last-modified parameter"))))
  }

  private def lastModified(path: String)(implicit request: RequestHeader): Future[Option[DateTime]] = LiveContentApi
    .item(path, Edition(request))
    .showFields("lastModified")
    .response
    .map(_.content.map(_.safeFields("lastModified").parseISODateTime))

}

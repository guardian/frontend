package controllers

import play.api.mvc.{Action, Controller}
import frontsapi.FrontsApi
import common.{ExecutionContexts, JsonComponent}
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.concurrent.Akka
import play.api.Play.current

object FrontsApiController extends Controller with ExecutionContexts {
  implicit val updateListReads = Json.reads[UpdateList]
  implicit val jsonResponseWrites = Json.writes[JsonResponse]

  lazy val positionNotFound = JsonResponse("Position Not Found")
  lazy val invalidJson = JsonResponse("Invalid Json")
  lazy val databaseError = JsonResponse("Database Error")

  def getLists = Action { implicit request =>
    val result = Akka.future { FrontsApi.getLists }
    Async {
      result map {l => JsonComponent("lists" -> toJson(l))}
    }
  }
  def getList(listName: String) = Action { implicit request =>
    val result = Akka.future { FrontsApi.getList(listName) }
    Async {
      result map {l => JsonComponent(listName -> toJson(l)) }
    }
  }

  def updateList(listName: String) = Action {
    implicit request =>
      request.body.asJson map {
        json =>
          json.asOpt[UpdateList] map {
            ul =>
              val promiseOfOption = Akka.future {
                FrontsApi.add(listName, ul.position, ul.item, ul.after)
              }
              Async {
                promiseOfOption map {
                  o => o match {
                    case Some(v) if v >= 0 => Ok
                    case Some(v) => BadRequest(toJson(positionNotFound))
                    case None => BadRequest(toJson(databaseError))
                  }
                }
              }
          } getOrElse BadRequest(toJson(invalidJson))
      } getOrElse BadRequest
  }

  def bootStrap = Action {
    TestData.top10list.map{FrontsApi.push("test", _)}
    Ok
  }

}

object TestData {
  val top10list = Seq("global/2013/jun/26/usa",
                      "politics/2013/jun/26/osborne-s-spending-review-winners-and-losers-at-a-glance",
                      "world/2013/jun/26/julia-gillard-australia-prime-minister-kevin-rudd",
                      "teacher-network/teacher-blog/2013/jun/26/teaching-assistant-to-teacher-career-advice",
                      "technology/appsblog/2013/jun/26/candy-crush-saga-puzzle-and-dragons",
                      "politics/blog/2013/jun/26/osborne-spending-review-2013-live",
                      "society/2013/jun/26/carers-cancer-patients-support",
                      "sport/video/2013/jun/26/surfing-joel-parkinson-perfect-20-video",
                      "world/gallery/2013/jun/26/australian-politics-in-and-out",
                      "football/2013/jun/26/the-fiver-carlos-tevez")
}

case class UpdateList(item: String, position: String, after: Option[Boolean])
case class JsonResponse(message: String)
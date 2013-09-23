package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.{MostPopularExpandableAgent, MostPopularAgent}
import play.api.libs.json._
import play.api.libs.json.Json

import concurrent.Future
import scala.util.Random
import views.support.cleanTrailText

object MostPopularController extends Controller with Logging with ExecutionContexts {

  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  def render(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopular("The Guardian", "", MostPopularAgent.mostPopular(edition))
    val promiseOfSectionPopular = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          sectionPopular :+ globalPopular match {
            case Nil => NotFound
            case popular => {
              Cached(900){
                if (request.isJson)
                  JsonComponent(
                    "html" -> views.html.fragments.mostPopular(popular, 5),
                    "trails" -> popular.headOption.map(_.trails).getOrElse(Nil).map(_.url),
                    "fullTrails" -> JsArray(popular.headOption.map(_.trails).getOrElse(Nil).map{ trail =>
                      Json.obj(
                        "url" -> trail.url,
                        "headline" -> trail.headline,
                        "trailText" -> trail.trailText.map{ text =>
                          cleanTrailText(text)(Edition(request)).toString()
                        },
                        "mainPicture" -> trail.mainPicture(620).map{ mainPicture =>
                          Json.obj(
                            "path" -> mainPicture.path
                          )
                        },
                        "published" ->Json.obj(
                          "unix" -> trail.webPublicationDate.getMillis,
                          "datetime" -> trail.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ"),
                          ("datetimeShort", trail.webPublicationDate.toString("d MMM y"))
                        )
                      )
                    })
                  )
                else
                  Ok(views.html.mostPopular(page, popular))
              }
            }
          }
      }
    }
  }

  def renderExpandable(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopular("The Guardian", "", MostPopularExpandableAgent.mostPopular(edition))
    val promiseOfSectionPopular = if (path.nonEmpty) lookupExpandable(edition, path).map(_.toList) else Future(Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          sectionPopular :+ globalPopular match {
            case Nil => NotFound
            case popular => {
              Cached(900){
                if (request.isJson)
                  JsonComponent(
                    "html" -> views.html.fragments.mostPopularExpandable(popular, 5),
                    "trails" -> popular.headOption.map(_.trails).getOrElse(Nil).map(_.url)
                  )
                else
                  Ok(views.html.mostPopular(page, popular))
              }
            }
          }
      }
    }
  }

  def renderCard() = Action { implicit request =>
    val edition = Edition(request)
    val trails = Random.shuffle(MostPopularAgent.mostPopular(edition))
    if(trails.nonEmpty) {
      val jsonResponse = () => views.html.fragments.cards.card(trails.head, "right", "Most read", "Story pack card | most read")
      renderFormat(jsonResponse, 60)
    } else {
      NotFound
    }
  }

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .response.map{response =>
      val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
          val popular = SupportedContentFilter(response.mostViewed map { Content(_) }) take (10)

          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }

  private def lookupExpandable(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .showFields("headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl,body")
      .response.map{response =>
      val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
      val popular = SupportedContentFilter(response.mostViewed map { Content(_) }) take (10)

      if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }
}

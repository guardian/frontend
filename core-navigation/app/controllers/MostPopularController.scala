package controllers

import common._
import conf._
import feed.{ MostPopularExpandableAgent, MostPopularAgent }
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.json._
import play.api.libs.json.Json
import scala.concurrent.Future
import scala.util.Random
import views.support.{Profile, ImgSrc, cleanTrailText}


object MostPopularController extends Controller with Logging with ExecutionContexts {

  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopular("The Guardian", "", MostPopularAgent.mostPopular(edition))
    val sectionPopular: Future[List[MostPopular]] = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)

    sectionPopular.map { sectionPopular =>
      sectionPopular :+ globalPopular match {
        case Nil => NotFound
        case popular if !request.isJson => Cached(900) { Ok(views.html.mostPopular(page, popular)) }
        case popular => Cached(900) {
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
                "itemPicture" -> trail.trailPicture(5,3).map{ trailPictures =>
                  trailPictures.largestImage.map { largestImage =>
                    largestImage.url.map(ImgSrc(_, Profile("item-{width}")))
                  }
                },
                "published" ->Json.obj(
                  "unix" -> trail.webPublicationDate.getMillis,
                  "datetime" -> trail.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ"),
                  ("datetimeShort", trail.webPublicationDate.toString("d MMM y"))
                )
              )
            })
          )
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
          val popular = response.mostViewed map { Content(_) } take (10)
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
      val popular = response.mostViewed map { Content(_) } take (10)

      if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }
}

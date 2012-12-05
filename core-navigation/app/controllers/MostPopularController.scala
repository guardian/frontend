package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka

object MostPopularController extends Controller with Logging {

  import play.api.Play.current

  def render(edition: String, path: String) = Action { implicit request =>

    val promiseOfGlobalPopular = Akka.future(lookup(edition, "/").toList)
    val promiseOfSectionPopular = Akka.future(if (path != "/") lookup(edition, path).toList else Nil)

    Async {
      promiseOfSectionPopular.flatMap { sectionPopular =>
        promiseOfGlobalPopular.map { globalPopular =>
          (sectionPopular ++ globalPopular) match {
            case Nil => NotFound
            case popular => renderMostPopular(popular)
          }
        }
      }
    }
  }

  def renderGlobal(edition: String) = render(edition, "/")

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[MostPopular] = suppressApi404 {
    log.info("Fetching most popular: " + path + " for edition " + edition)

    val response: ItemResponse = ContentApi.item(path, edition)
      .showMostViewed(true)
      .response

    val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
    val popular = response.mostViewed map { new Content(_) } take (10)

    if (popular.isEmpty) None else Some(MostPopular(heading, popular))
  }

  private def renderMostPopular(popular: Seq[MostPopular])(implicit request: RequestHeader) =
    Cached(900)(JsonComponent(views.html.fragments.mostPopular(popular, 5)))

}
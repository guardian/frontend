package controllers

import common._
import front._
import model._
import play.api.mvc._
import play.api.libs.json.Json
import views.support.{TemplateDeduping, NewsContainer}
import scala.concurrent.Future
import play.api.templates.Html
import performance.MemcachedAction


class FaciaController extends Controller with Logging with ExecutionContexts with implicits.Collections {

  val EditionalisedKey = """^\w\w(/.*)?$""".r

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def editionRedirect(path: String) = Action{ implicit request =>

    val edition = Edition(request)
    val editionBase = s"/${edition.id.toLowerCase}"

    val redirectPath = path match {
      case "" => editionBase
      case sectionFront => s"$editionBase/$sectionFront"
    }

    Cached(60)(Redirect(redirectPath))
  }

  // Needed as aliases for reverse routing
  def renderFrontRss(id: String) = renderFront(id)
  def renderFrontJson(id: String) = renderFront(id)
  def renderCollectionRss(id: String) = renderCollection(id)
  def renderCollectionJson(id: String) = renderCollection(id)
  def renderContainerJson(id: String) = renderContainer(id)

  def renderFront(path: String) = {
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.getPathIds.contains(path))
      IndexController.render(path)
    else
      renderFrontPress(path)
  }

  def renderFrontPress(path: String) = MemcachedAction{ implicit request =>
    FrontJson.get(path).map(_.map{ faciaPage =>
      val frontPage = SwitchingFrontPage(faciaPage)
      Cached(frontPage) {
        if (request.isRss)
          Ok(TrailsToRss(frontPage, faciaPage.collections.map(_._2).flatMap(_.items).toSeq.distinctBy(_.id)))
            .as("text/xml; charset=utf-8")
        else if (request.isJson)
          JsonFront(frontPage, faciaPage)
        else
          Ok(views.html.front(frontPage, faciaPage))
      }
    }.getOrElse(Cached(60)(NotFound)))
  }

  def renderCollection(id: String) = MemcachedAction{ implicit request =>
    log.info(s"Serving collection ID: $id")
    getPressedCollection(id).map { collectionOption =>
      collectionOption.map { collection =>
        Cached(60) {
          val config: Config = ConfigAgent.getConfig(id).getOrElse(Config(""))
          if (request.isRss) {
            Ok(TrailsToRss(config.displayName, collection.items)).as("text/xml; charset=utf-8")
          } else {
            val html = views.html.fragments.collections.standard(Config(id), collection.items, NewsContainer(showMore = false), 1)
            if (request.isJson)
              JsonCollection(html, collection)
            else
              Ok(html)
          }
        }
      }.getOrElse(ServiceUnavailable)
    }
  }

  def renderContainer(id: String) = MemcachedAction { implicit request =>
      log.info(s"Serving collection ID: $id")
      getPressedCollection(id).map { collectionOption =>
        collectionOption.map { collection =>
          Cached(60) {
            val config: Config = ConfigAgent.getConfig(id).getOrElse(Config(""))
            val html = views.html.fragments.frontCollection(SwitchingFrontPage.getDefaultFrontPage, (config, collection), 1, 1)
            if (request.isJson)
              JsonCollection(html, collection)
            else
              NotFound
          }
        }.getOrElse(ServiceUnavailable)
      }
  }

  private object JsonCollection{
    def apply(html: Html, collection: Collection)(implicit request: RequestHeader) = JsonComponent(
      "html" -> html
    )
  }

  private object JsonFront{
    def apply(frontPage: FrontPage, faciaPage: FaciaPage)(implicit request: RequestHeader) = JsonComponent(
      "html" -> views.html.fragments.frontBody(frontPage, faciaPage),
      "config" -> Json.parse(views.html.fragments.javaScriptConfig(frontPage).body)
    )
  }

  private def getPressedCollection(collectionId: String): Future[Option[Collection]] =
    ConfigAgent.getConfigsUsingCollectionId(collectionId).headOption.map { path =>
      FrontJson.get(path).map(_.flatMap{ faciaPage =>
        faciaPage.collections.find{ case (c, col) => c.id == collectionId}.map(_._2)
      })
    }.getOrElse(Future.successful(None))
}

object FaciaController extends FaciaController

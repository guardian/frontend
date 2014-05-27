package controllers

import common._
import front._
import model._
import play.api.mvc._
import play.api.libs.json.{JsObject, JsValue, Json}
import views.support.{TemplateDeduping, NewsContainer}
import scala.concurrent.Future
import play.api.templates.Html
import performance.MemcachedAction
import services.ConfigAgent


class FaciaController extends Controller with Logging with ExecutionContexts with implicits.Collections with implicits.Requests {

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

  def applicationsRedirect(path: String) = Action { implicit request =>
    Ok.withHeaders("X-Accel-Redirect" -> (s"/applications/$path" +
      (if (request.isRss) "/rss" else "") +
      (if (request.queryString.nonEmpty) s"?${request.rawQueryString}" else "")))
  }

  //Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
  def renderFrontPressSpecial(path: String) = renderFrontPress(path)

  // Needed as aliases for reverse routing
  def renderFrontRss(id: String) = renderFront(id)
  def renderFrontJson(id: String) = renderFront(id)
  def renderCollectionRss(id: String) = renderCollection(id)
  def renderCollectionJson(id: String) = renderCollection(id)
  def renderContainerJson(id: String) = renderContainer(id)

  def renderFront(path: String) = {
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.getPathIds.contains(path))
      applicationsRedirect(path)
    else
      renderFrontPress(path)
  }

  def getCollections(json: JsValue): Seq[JsValue] = {
    (json \ "collections").asOpt[Seq[Map[String, JsObject]]].getOrElse(Nil).flatMap{ c => c.values.map(getCollection) }
  }

  def getCollection(json: JsValue): JsValue = {
    Json.obj(
        "displayName" -> (json \ "displayName"),
        "href" -> (json \ "href"),
        "content" -> getContent(json)
    )
  }

  def getContent(json: JsValue): Seq[JsValue] = {
    val curated = (json \ "curated").asOpt[Seq[JsObject]].getOrElse(Nil)
    val editorsPicks = (json \ "editorsPicks").asOpt[Seq[JsObject]].getOrElse(Nil)
    val results = (json \ "results").asOpt[Seq[JsObject]].getOrElse(Nil)

    (curated ++ editorsPicks ++ results)
    .filterNot{ j =>
      (j \ "id").asOpt[String].exists(_.startsWith("snap/"))
     }
    .take(3).map{ j =>
      Json.obj(
        "headline" -> (j \ "safeFields" \ "headline"),
        "id" -> (j \ "id")
      )
    }
  }

  def renderFrontJsonLite(path: String) = MemcachedAction{ implicit request =>
    FrontJson.getAsJsValue(path).map{ json =>
      Cached(60)(Ok(Json.obj(
        "webTitle" -> (json \ "seoData" \ "webTitle"),
        "collections" -> getCollections(json)
      )))
    }
  }

  def renderFrontPress(path: String) = MemcachedAction{ implicit request =>
    FrontJson.get(path).map(_.map{ faciaPage =>
      Cached(faciaPage) {
        if (request.isRss)
          Ok(TrailsToRss(faciaPage, faciaPage.collections.map(_._2).flatMap(_.items).toSeq.distinctBy(_.id)))
            .as("text/xml; charset=utf-8")
        else if (request.isJson)
          JsonFront(faciaPage)
        else
          Ok(views.html.front(faciaPage))
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
            val html = views.html.fragments.collections.standard(collection.items, NewsContainer(showMore = false), 1)(request, Config(id))
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
            val html = views.html.fragments.frontCollection(FrontPage.defaultFrontPage, (config, collection), 1, 1)
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
    def apply(faciaPage: FaciaPage)(implicit request: RequestHeader) = JsonComponent(
      "html" -> views.html.fragments.frontBody(faciaPage),
      "config" -> Json.parse(views.html.fragments.javaScriptConfig(faciaPage).body)
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

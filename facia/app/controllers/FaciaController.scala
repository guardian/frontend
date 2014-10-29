package controllers

import com.gu.facia.client.models.CollectionConfig
import common._
import front._
import model._
import play.api.mvc._
import play.api.libs.json.{JsObject, JsValue, Json}
import updates.{CollectionWithLayout, FrontIndex}
import views.support.{TemplateDeduping, NewsContainer}
import scala.concurrent.Future
import play.twirl.api.Html
import performance.MemcachedAction
import services.ConfigAgent
import common.FaciaMetrics.FaciaToApplicationRedirectMetric
import views.html.fragments.containers.facia_cards.container


trait FaciaController extends Controller with Logging with ExecutionContexts with implicits.Collections with implicits.Requests {

  val EditionalisedKey = """^\w\w(/.*)?$""".r

  val frontJson: FrontJson

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def rootEditionRedirect() = editionRedirect(path = "")
  def editionRedirect(path: String) = Action{ implicit request =>

    val edition = Edition(request)
    val editionBase = s"/${edition.id.toLowerCase}"

    val redirectPath = path match {
      case "" => editionBase
      case sectionFront => s"$editionBase/$sectionFront"
    }

    Cached(60)(Redirect(redirectPath))
  }

  def applicationsRedirect(path: String)(implicit request : RequestHeader) = {
    FaciaToApplicationRedirectMetric.increment()
    Future.apply(InternalRedirect.internalRedirect("applications", path, if (request.queryString.nonEmpty) Option(s"?${request.rawQueryString}") else None))
  }

  //Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
  def renderFrontPressSpecial(path: String) = MemcachedAction { implicit  request => renderFrontPressResult(path) }

  // Needed as aliases for reverse routing
  def renderFrontJson(id: String) = renderFront(id)
  def renderContainerJson(id: String) = renderContainer(id)

  def renderFrontRss(path: String) = MemcachedAction { implicit  request =>
  log.info(s"Serving RSS Path: $path")
    if (!ConfigAgent.shouldServeFront(path))
      applicationsRedirect(s"$path/rss")
    else
      renderFrontPressResult(path)
  }

  def renderFront(path: String) = MemcachedAction { implicit request =>
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.shouldServeFront(path) || request.getQueryString("page").isDefined)
      applicationsRedirect(path)
    else
      renderFrontPressResult(path)
  }

  private def withFaciaPage(path: String)(f: FaciaPage => Result): Future[Result] = {
    if (ConfigAgent.shouldServeFront(path)) {
      for {
        maybeFront <- frontJson.get(path)
      } yield maybeFront match {
        case Some(front) => f(front)
        case None => Cached(60)(NotFound)
      }
    } else {
      Future.successful(Cached(60)(NotFound))
    }
  }

  def renderFrontIndex(path: String) = MemcachedAction { implicit request =>
    log.info(s"Serving front index: $path")

    withFaciaPage(path) { page =>
      Cached(60)(JsonComponent(Json.toJson(FrontIndex.fromFaciaPage(page)).asInstanceOf[JsObject]))
    }
  }

  def renderFrontJsonLite(path: String) = MemcachedAction{ implicit request =>
    frontJson.getAsJsValue(path).map{ json =>
      Cached(60)(JsonComponent(FrontJsonLite.get(json)))
    }
  }

  private def renderFrontPressResult(path: String)(implicit request : RequestHeader) = {
    val futureResult: Future[Result] = frontJson.get(path).map(_.map{ faciaPage =>
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
    futureResult.onFailure { case t: Throwable => log.error(s"Failed rendering $path with $t", t)}
    futureResult
  }

  def renderFrontPress(path: String) = MemcachedAction { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String) = MemcachedAction { implicit request =>
      log.info(s"Serving collection ID: $id")
      getPressedCollection(id).map { collectionOption =>
        collectionOption.map { collection =>
          Cached(60) {
            val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.emptyConfig)
            val html = views.html.fragments.frontCollection(FaciaPage.defaultFaciaPage, (config, collection), 1, 1, id)
            if (request.isJson)
              JsonCollection(html, collection)
            else
              NotFound
          }
        }.getOrElse(ServiceUnavailable)
      }
  }

  def renderFrontCollection(frontId: String, collectionId: String, version: String) = MemcachedAction { implicit request =>
    log.info(s"Serving collection $collectionId on front $frontId")

    withFaciaPage(frontId) { faciaPage =>
      val layouts = CollectionWithLayout.fromFaciaPage(faciaPage).zipWithIndex

      layouts.find(_._1.config.id == collectionId) match {
        case Some((CollectionWithLayout(collection, config, Some(containerLayout)), collectionIndex)) =>
          /** Deduping has already occurred, so pass in an empty instance */
          Cached(60) {
            JsonComponent(
              "html" -> container(collection, containerLayout, collectionIndex, dataId = config.id)(request, new TemplateDeduping, config.config)
            )
          }
        case _ => NotFound
      }
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
      frontJson.get(path).map(_.flatMap{ faciaPage =>
        faciaPage.collections.find{ case (c, col) => c.id == collectionId}.map(_._2)
      })
    }.getOrElse(Future.successful(None))

  /* Google news hits this endpoint */
  def renderCollectionRss(id: String) = MemcachedAction { implicit request =>
      log.info(s"Serving collection ID: $id")
      getPressedCollection(id).map { collectionOption =>
          collectionOption.map { collection =>
              Cached(60) {
                val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.emptyConfig)
                  Ok(TrailsToRss(config.displayName, collection.items)).as("text/xml; charset=utf8")
              }
          }.getOrElse(ServiceUnavailable)
      }
  }

  def renderAgentContents = Action {
    Ok(ConfigAgent.contentsAsJsonString)
  }
}

object FaciaController extends FaciaController {
  val frontJson: FrontJson = FrontJsonLive
}

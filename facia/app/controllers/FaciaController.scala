package controllers

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import common.FaciaMetrics._
import common._
import common.editions.EditionalisedSections
import conf.Configuration.commercial.expiredAdFeatureUrl
import controllers.front._
import layout.{CollectionEssentials, FaciaContainer}
import model._
import performance.MemcachedAction
import play.api.libs.json.Json
import play.api.mvc._
import play.twirl.api.Html
import services.{CollectionConfigWithId, ConfigAgent}
import slices.Container
import views.html.fragments.containers.facia_cards.container

import scala.concurrent.Future
import scala.concurrent.Future.successful

trait FaciaController extends Controller with Logging with ExecutionContexts with implicits.Collections with implicits.Requests {

  val EditionalisedKey = """^\w\w(/.*)?$""".r

  val frontJson: FrontJson

  // TODO - these should not be separate endpoints
  // see comment in routes file...
  def rootEditionRedirect() = editionRedirect(path = "")
  def editionRedirect(path: String) = Action.async { implicit request =>
    if (request.getQueryString("page").isDefined) {
      applicationsRedirect(path)
    } else {
      val edition = Edition(request)
      val editionBase = s"/${edition.id.toLowerCase}"

      val redirectPath = path match {
        case "" => editionBase
        case sectionFront => s"$editionBase/$sectionFront"
      }

      Future.successful(Cached(60)(Redirect(redirectPath)))
    }
  }

  def applicationsRedirect(path: String)(implicit request: RequestHeader) = {
    FaciaToApplicationRedirectMetric.increment()
    Future.apply(InternalRedirect.internalRedirect("applications", path, if (request.queryString.nonEmpty) Option(s"?${request.rawQueryString}") else None))
  }

  def rssRedirect(path: String)(implicit request: RequestHeader) = {
    FaciaToRssRedirectMetric.increment()
    Future.successful(InternalRedirect.internalRedirect(
      "rss_server",
      path,
      if (request.queryString.nonEmpty) Option(s"?${request.rawQueryString}") else None
    ))
  }

  //Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
  def renderFrontPressSpecial(path: String) = MemcachedAction { implicit request => renderFrontPressResult(path) }

  // Needed as aliases for reverse routing
  def renderFrontJson(id: String) = renderFront(id)
  def renderContainerJson(id: String) = renderContainer(id)

  def renderFrontRss(path: String) = MemcachedAction { implicit  request =>
  log.info(s"Serving RSS Path: $path")
    if (!ConfigAgent.shouldServeFront(path))
      rssRedirect(s"$path/rss")
    else
      renderFrontPressResult(path)
  }

  def renderFront(path: String) = MemcachedAction { implicit request =>
    log.info(s"Serving Path: $path")
    if (EditionalisedSections.isEditionalised(path) && !request.getQueryString("page").isDefined)
      redirectToEditionalisedVersion(path)
    else if (!ConfigAgent.shouldServeFront(path) || request.getQueryString("page").isDefined)
      applicationsRedirect(path)
    else
      renderFrontPressResult(path)
  }

  def redirectToEditionalisedVersion(path: String)(implicit request: RequestHeader): Future[Result] = {
    successful(Cached(60)(Found(LinkTo(Editionalise(s"/$path", request)))))
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

  def renderFrontJsonLite(path: String) = MemcachedAction{ implicit request =>
    val cacheTime = path match {
      case p if p.startsWith("breaking-news") => 10
      case _ => 60
    }

    frontJson.getAsJsValue(path).map{ json =>
      Cached(cacheTime)(Cors(JsonComponent(FrontJsonLite.get(json))))
    }
  }

  private[controllers] def renderFrontPressResult(path: String)(implicit request : RequestHeader) = {
    val futureResult = for {
      maybeFaciaPage <- frontJson.get(path)
    } yield maybeFaciaPage match {
      case Some(faciaPage) =>
        Cached(faciaPage) {
          if (request.isRss)
            Ok(TrailsToRss(
              faciaPage,
              faciaPage.collections
                .filterNot(_._1.config.excludeFromRss.exists(identity))
                .map(_._2)
                .flatMap(_.items)
                .toSeq
                .distinctBy(_.id))
            ).as("text/xml; charset=utf-8")
          else if (request.isJson)
            JsonFront(faciaPage)
          else if (faciaPage.isExpiredAdvertisementFeature)
            MovedPermanently(expiredAdFeatureUrl)
          else
            Ok(views.html.front(faciaPage))
        }

      case None => Cached(60)(NotFound)
    }

    futureResult onFailure { case t: Throwable => log.error(s"Failed rendering $path with $t", t)}

    futureResult
  }

  def renderFrontPress(path: String) = MemcachedAction { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String) = MemcachedAction { implicit request =>
      log.info(s"Serving collection ID: $id")
      getPressedCollection(id).map { collectionOption =>
        collectionOption.map { collection =>
          Cached(60) {
            val config = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.emptyConfig)

            val containerDefinition = FaciaContainer(
              1,
              Container.fromConfig(config),
              CollectionConfigWithId(id, config),
              CollectionEssentials.fromCollection(collection)
            )

            val html = container(containerDefinition, FaciaPage.defaultFaciaPage.frontProperties)
            if (request.isJson)
              JsonCollection(html, collection)
            else
              NotFound
          }
        }.getOrElse(ServiceUnavailable)
      }
  }

  def renderShowMore(path: String, collectionId: String) = MemcachedAction { implicit request =>
    for {
      maybeFaciaPage <- frontJson.get(path)
    } yield {
      val maybeResponse = for {
        faciaPage <- maybeFaciaPage
        (container, index) <- faciaPage.front.containers.zipWithIndex.find(_._1.dataId == collectionId)
        containerLayout <- container.containerLayout
      } yield {
        Cached(faciaPage) {
          JsonComponent(views.html.fragments.containers.facia_cards.showMore(
            containerLayout.remainingCards,
            index
          ))
        }
      }
      maybeResponse getOrElse Cached(60)(NotFound)
    }
  }

  def renderFrontCollection(frontId: String, collectionId: String, version: String) = MemcachedAction { implicit request =>
    log.info(s"Serving collection $collectionId on front $frontId")

    withFaciaPage(frontId) { faciaPage =>
      faciaPage.front.containers.find(_.dataId == collectionId) match {
        case Some(containerDefinition) =>
          Cached(60) {
            JsonComponent(
              "html" -> container(containerDefinition, faciaPage.frontProperties)(request)
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

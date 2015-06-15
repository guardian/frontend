package controllers

import com.gu.facia.api.models.CollectionConfig
import common.FaciaMetrics._
import common._
import common.editions.EditionalisedSections
import conf.Configuration.commercial.expiredAdFeatureUrl
import conf.Switches
import controllers.front._
import layout.{Front, CollectionEssentials, FaciaContainer}
import model._
import model.facia.PressedCollection
import performance.MemcachedAction
import play.api.libs.json.{JsObject, Json}
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
  val frontJsonFapi: FrontJsonFapi

  // TODO - these should not be separate endpoints
  // see comment in routes file...
  def rootEditionRedirect() = editionRedirect(path = "")
  def editionRedirect(path: String) = Action.async { implicit request =>
    if (request.getQueryString("page").isDefined) {
      applicationsRedirect(path)
    } else {
      val edition = Edition(request)
      val editionBase = InternationalEdition(request)
        .filter(_.isInternational && path == "") // ONLY the network front
        .map(_ => InternationalEdition.path)
        .getOrElse(s"/${edition.id.toLowerCase}")

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

  private def withPressedPage(path: String)(f: PressedPage => Result): Future[Result] = {
    if (ConfigAgent.shouldServeFront(path)) {
      for {
        maybeFront <- frontJson.get(path)
          .flatMap {
            case Some(pressedPage) => Future.successful(Option(PressedPage.fromFaciaPage(pressedPage)))
            case _ => frontJsonFapi.get(path)}
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
      case _ => 60}

    lazy val newFormat = frontJsonFapi.get(path).map {
        case Some(pressedPage) => Cached(cacheTime)(Cors(JsonComponent(FapiFrontJsonLite.get(pressedPage))))
        case None => Cached(cacheTime)(Cors(JsonComponent(JsObject(Nil))))}
    lazy val oldFormat = frontJson.getAsJsValue(path).map { json =>
      Cached(cacheTime)(Cors(JsonComponent(FrontJsonLite.get(json))))}

    if (Switches.FaciaServerNewFormat.isSwitchedOn) {
      newFormat.fallbackTo(oldFormat)}
    else {
      oldFormat}
  }



  private[controllers] def renderFrontPressResultFallback(path: String)(implicit request : RequestHeader) = {
    val futureResult = for {
      maybeFaciaPage <- frontJson.get(path)
    } yield maybeFaciaPage match {
        case Some(faciaPage) =>
          Cached(faciaPage) {
            if (request.isRss)
              Ok(TrailsToRss(
                faciaPage,
                faciaPage.collections
                  .filterNot(_._1.config.excludeFromRss)
                  .map(_._2)
                  .flatMap(_.items)
                  .toSeq
                  .distinctBy(_.id))
              ).as("text/xml; charset=utf-8")
            else if (request.isJson)
              JsonFront(PressedPage.fromFaciaPage(faciaPage))
            else if (faciaPage.isExpiredAdvertisementFeature)
              MovedPermanently(expiredAdFeatureUrl)
            else
              Ok(views.html.front(PressedPage.fromFaciaPage(faciaPage)))
          }
        case None => Cached(45)(NotFound)
      }
    futureResult onFailure { case t: Throwable => log.error(s"Failed rendering $path with $t", t)}
    futureResult
  }

  private[controllers] def renderFrontPressResult(path: String)(implicit request : RequestHeader) = {
    if (Switches.FaciaServerNewFormat.isSwitchedOn) {
      val futureResult = frontJsonFapi.get(path).flatMap {
        case Some(faciaPage) =>
          Future.successful(
            Cached(faciaPage) {
              if (request.isRss)
                Ok(TrailsToRss.fromPressedPage(faciaPage)).as("text/xml; charset=utf-8")
              else if (request.isJson)
                JsonFront(faciaPage)
              else if (faciaPage.isExpiredAdvertisementFeature)
                MovedPermanently(expiredAdFeatureUrl)
              else
                Ok(views.html.front(faciaPage))
            }
          )
        case None => renderFrontPressResultFallback(path)
      }

      futureResult onFailure { case t: Throwable => log.error(s"Failed rendering $path with $t", t)}
      futureResult.fallbackTo(renderFrontPressResultFallback(path))

      futureResult
    } else {
      renderFrontPressResultFallback(path)
    }

  }

  def renderFrontPress(path: String) = MemcachedAction { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String) = MemcachedAction { implicit request =>
    log.info(s"Serving collection ID: $id")
    lazy val oldFormat = renderContainerFallback(id)
    lazy val newFormat =
      getPressedCollection(id).map { collectionOption =>
        collectionOption.map { collection =>
          Cached(60) {
            val config = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)

            val containerDefinition = FaciaContainer(
              1,
              Container.fromConfig(config),
              CollectionConfigWithId(id, config),
              CollectionEssentials.fromPressedCollection(collection)
            )

            val html = container(containerDefinition, FaciaPage.defaultFaciaPage.frontProperties)
            if (request.isJson)
              JsonCollection(html, collection)
            else
              NotFound
          }
        }.getOrElse(ServiceUnavailable)
      }

    if (Switches.FaciaServerNewFormat.isSwitchedOn) {
      newFormat.fallbackTo(oldFormat)
    } else {
      oldFormat
    }
  }

  def renderContainerFallback(id: String)(implicit request: RequestHeader) = {
   log.info(s"Serving collection ID: $id")
    getPressedCollectionFallback(id).map { collectionOption =>
      collectionOption.map { collection =>
        Cached(60) {
          val config = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)

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
    lazy val oldFormat = renderShowMoreFallback(path, collectionId)
    if (Switches.FaciaServerNewFormat.isSwitchedOn) {
      lazy val newFormat = frontJsonFapi.get(path).flatMap {
        case Some(pressedPage) =>
          val maybeResponse =
            for {
              (container, index) <- Front.fromPressedPage(pressedPage).containers.zipWithIndex.find(_._1.dataId == collectionId)
              containerLayout <- container.containerLayout
            } yield
            Future.successful{Cached(pressedPage) {
              JsonComponent(views.html.fragments.containers.facia_cards.showMore(containerLayout.remainingCards, index))}}

          maybeResponse getOrElse Future.successful(Cached(60)(NotFound))
        case None => renderShowMoreFallback(path, collectionId)}
      newFormat.fallbackTo(oldFormat)
    }
    else {
      oldFormat}}



  def renderShowMoreFallback(path: String, collectionId: String)(implicit request : RequestHeader): Future[Result] = {
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

  def renderFrontCollection(frontId: String, collectionId: String) = MemcachedAction { implicit request =>
    log.info(s"Serving collection $collectionId on front $frontId")

    withPressedPage(frontId) { pressedPage =>
      Front.fromPressedPage(pressedPage).containers.find(_.dataId == collectionId) match {
        case Some(containerDefinition) =>
          Cached(60) {
            JsonComponent(
              "html" -> container(containerDefinition, pressedPage.frontProperties)(request)
            )
          }
        case _ => NotFound
      }
    }
  }

  private object JsonCollection{
    def apply(html: Html, collection: PressedCollection)(implicit request: RequestHeader) = JsonComponent(
      "html" -> html
    )

    def apply(html: Html, collection: Collection)(implicit request: RequestHeader) = JsonComponent(
      "html" -> html
    )
  }

  private object JsonFront{
    def apply(faciaPage: PressedPage)(implicit request: RequestHeader) = JsonComponent(
      "html" -> views.html.fragments.frontBody(faciaPage),
      "config" -> Json.parse(views.html.fragments.javaScriptConfig(faciaPage).body)
    )
  }

  private def getPressedCollection(collectionId: String): Future[Option[PressedCollection]] =
    ConfigAgent.getConfigsUsingCollectionId(collectionId).headOption.map { path =>
      frontJsonFapi.get(path).map(_.flatMap{ faciaPage =>
        faciaPage.collections.find{ c => c.id == collectionId}
      })
    }.getOrElse(Future.successful(None))

  private def getPressedCollectionFallback(collectionId: String): Future[Option[Collection]] =
    ConfigAgent.getConfigsUsingCollectionId(collectionId).headOption.map { path =>
      frontJson.get(path).map(_.flatMap{ faciaPage =>
        faciaPage.collections.find{ case (c, col) => c.id == collectionId}.map(_._2)
      })
    }.getOrElse(Future.successful(None))

  /* Google news hits this endpoint */
  def renderCollectionRss(id: String) = MemcachedAction { implicit request =>
    log.info(s"Serving collection ID: $id")
    lazy val oldFormat = renderCollectionRssFallback(id)
    lazy val newFormat =
      getPressedCollection(id).flatMap {
        case Some(collection) =>
          Future.successful{
            Cached(60) {
              val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)
              val webTitle = config.displayName.getOrElse("The Guardian")
              Ok(TrailsToRss.fromFaciaContent(webTitle, collection.all, "", None)).as("text/xml; charset=utf8")}}

        case None => renderCollectionRssFallback(id)}

    if (Switches.FaciaServerNewFormat.isSwitchedOn) {
      newFormat.fallbackTo(oldFormat)
    } else {
      oldFormat
    }
  }

  /* Google news hits this endpoint */
  def renderCollectionRssFallback(id: String)(implicit request: RequestHeader) = {
    log.info(s"Serving collection ID: $id")
    getPressedCollectionFallback(id).map { collectionOption =>
      collectionOption.map { collection =>
        Cached(60) {
          val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)
          Ok(TrailsToRss(config.displayName, collection.items)).as("text/xml; charset=utf8")
        }
      }.getOrElse(NotFound(s"Could not find $id"))
    }
  }

  def renderAgentContents = Action {
    Ok(ConfigAgent.contentsAsJsonString)
  }
}

object FaciaController extends FaciaController {
  val frontJson: FrontJson = FrontJsonLive
  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiLive
}

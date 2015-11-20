package controllers

import com.gu.facia.api.models.CollectionConfig
import common.FaciaMetrics._
import common._
import controllers.front._
import layout.{CollectionEssentials, FaciaContainer, Front}
import model._
import model.facia.PressedCollection
import performance.MemcachedAction
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._
import play.twirl.api.Html
import services.{CollectionConfigWithId, ConfigAgent}
import slices._
import views.html.fragments.containers.facia_cards.container

import scala.concurrent.Future
import scala.concurrent.Future.successful

trait FaciaController extends Controller with Logging with ExecutionContexts with implicits.Collections with implicits.Requests {

  val EditionalisedKey = """^\w\w(/.*)?$""".r

  val frontJsonFapi: FrontJsonFapi

  def applicationsRedirect(path: String)(implicit request: RequestHeader) = {
    FaciaToApplicationRedirectMetric.increment()
    successful(InternalRedirect.internalRedirect("applications", path, request.rawQueryStringOption.map("?" + _)))
  }

  def rssRedirect(path: String)(implicit request: RequestHeader) = {
    FaciaToRssRedirectMetric.increment()
    successful(InternalRedirect.internalRedirect(
      "rss_server",
      path,
      request.rawQueryStringOption.map("?" + _)
    ))
  }

  //Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
  def renderFrontPressSpecial(path: String) = MemcachedAction { implicit request => renderFrontPressResult(path) }

  // Needed as aliases for reverse routing
  def renderFrontJson(id: String) = renderFront(id)
  def renderContainerJson(id: String) = renderContainer(id, false)

  def renderContainerJsonWithFrontsLayout(id: String) = renderContainer(id, true)

  // Needed as aliases for reverse routing
  def renderRootFrontRss() = renderFrontRss(path = "")
  def renderFrontRss(path: String) = MemcachedAction { implicit  request =>
    log.info(s"Serving RSS Path: $path")
    if (shouldEditionRedirect(path))
      redirectTo(s"${Editionalise(path, Edition(request))}/rss")
    else if (!ConfigAgent.shouldServeFront(path))
      rssRedirect(s"$path/rss")
    else
      renderFrontPressResult(path)
  }

  def rootEditionRedirect() = renderFront(path = "")
  def renderFront(path: String) = MemcachedAction { implicit request =>
    log.info(s"Serving Path: $path")
    if (shouldEditionRedirect(path))
      redirectTo(Editionalise(path, Edition(request)))
    else if (!ConfigAgent.shouldServeFront(path) || request.getQueryString("page").isDefined)
      applicationsRedirect(path)
    else
      renderFrontPressResult(path)
  }

  private def shouldEditionRedirect(path: String)(implicit request: RequestHeader) = {
    val editionalisedPath = Editionalise(path, Edition(request))
    (editionalisedPath != path) && request.getQueryString("page").isEmpty
  }

  def redirectTo(path: String)(implicit request: RequestHeader): Future[Result] = successful {
    val params = request.rawQueryStringOption.map(q => s"?$q").getOrElse("")
    Cached(60)(Found(LinkTo(s"/$path$params")))
  }

  def renderFrontJsonLite(path: String) = MemcachedAction{ implicit request =>
    val cacheTime = path match {
      case p if p.startsWith("breaking-news") => 10
      case _ => 60}

    frontJsonFapi.get(path).map {
        case Some(pressedPage) => Cached(cacheTime)(Cors(JsonComponent(FapiFrontJsonLite.get(pressedPage))))
        case None => Cached(cacheTime)(Cors(JsonComponent(JsObject(Nil))))}
  }

  private[controllers] def renderFrontPressResult(path: String)(implicit request : RequestHeader) = {
    val futureResult = frontJsonFapi.get(path).flatMap {
      case Some(faciaPage) =>
        successful(
          Cached(faciaPage) {
            if (request.isRss)
              Ok(TrailsToRss.fromPressedPage(faciaPage)).as("text/xml; charset=utf-8")
            else if (request.isJson)
              JsonFront(faciaPage)
            else
              Ok(views.html.front(faciaPage))
          })
      case None => successful(Cached(60)(NotFound))}

    futureResult.onFailure { case t: Throwable => log.error(s"Failed rendering $path with $t", t)}
    futureResult
  }

  def renderFrontPress(path: String) = MemcachedAction { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String, preserveLayout: Boolean = false) = MemcachedAction { implicit request =>
    log.info(s"Serving collection ID: $id")
    renderContainerView(id, preserveLayout)
  }

  def renderMostRelevantContainerJson(path: String) = MemcachedAction { implicit request =>
    log.info(s"Serving most relevant container for $path")

    val canonicalId = ConfigAgent.getCanonicalIdForFront(path).orElse (
      alternativeEndpoints(path).map(ConfigAgent.getCanonicalIdForFront).headOption.flatten
    )

    canonicalId.map { collectionId =>
      renderContainerView(collectionId)
    }.getOrElse(successful(NotFound))
  }

  def renderEssentialRead(contentSource: String, edition: String) = MemcachedAction { implicit request =>
    log.info(s"Serving essential read")

    def pressedCollections: Future[Seq[PressedCollection]] = contentSource match {
      case "automated" =>
        val containerId = edition match {
            case "uk" => "uk-alpha/news/regular-stories"
            case "us" => "us-alpha/news/regular-stories"
            case "au" => "au-alpha/news/regular-stories"
            case _ => "10f21d96-18f6-426f-821b-19df55dfb831"
        }

        getFirstXCollections(containerId, 4).flatMap { // 4 not 3 so that we have some extra pieces of content to play with when filtering later
          _ match {
            case Some(x) => Future.successful(x)
            case None => Future.failed(new RuntimeException(s"Collection doesn't exist"))
          }
        }

      case "curated" =>
        val containerId = edition match {
          case "uk" => "2b4a1ca9-7af9-453e-accc-6870d3a3ec74"
          case "us" => "0295b390-8218-4eda-8bd4-2757c7d186f6"
          case "au" => "ec4dc5bf-399c-4720-a70c-dac3d96a26d3"
          case _ => "2b4a1ca9-7af9-453e-accc-6870d3a3ec74"
        }

        getPressedCollection(containerId).map(_.toSeq)
    }

    pressedCollections.map { collections =>
        Cached(60) {
          val config = CollectionConfig.empty.copy(
            displayName = Some("the essential read")
          )

          val collectionEssentials = if (contentSource == "curated") {
            CollectionEssentials.fromMultiplePressedCollections(collections)
          } else {
            CollectionEssentials.fromMultiplePressedCollections(collections, 2)
          }

          val containerDefinition = FaciaContainer(
            1,
            EssentialRead,
            CollectionConfigWithId("", config), // Empty string for essential read AB test
            collectionEssentials
          )

          val html = container(containerDefinition, FrontProperties.empty)
          if (request.isJson)
            JsonCollection(html)
          else
            NotFound
        }
    }
  }

  def alternativeEndpoints(path: String) = path.split("/").toList.take(2).reverse

  private def renderContainerView(collectionId: String, preserveLayout: Boolean = false)(implicit request: RequestHeader): Future[Result] = {
    log.info(s"Rendering container view for collection id $collectionId")
    getPressedCollection(collectionId).map { collectionOption =>
      collectionOption.map { collection =>
        Cached(60) {
          val config = ConfigAgent.getConfig(collectionId).getOrElse(CollectionConfig.empty)

          val containerLayout = {
            if (preserveLayout)
              Container.resolve(collection.collectionType)
            else
              Fixed(FixedContainers.fixedMediumFastXII)
          }

          val containerDefinition = FaciaContainer(
            1,
            containerLayout,
            CollectionConfigWithId(collectionId, config),
            CollectionEssentials.fromPressedCollection(collection)
          )

          val html = container(containerDefinition, FrontProperties.empty)
          if (request.isJson)
            JsonCollection(html)
          else
            NotFound
        }
      }.getOrElse(ServiceUnavailable)
    }
  }

  def renderShowMore(path: String, collectionId: String) = MemcachedAction { implicit request =>
    frontJsonFapi.get(path).flatMap {
      case Some(pressedPage) =>
        val containers = Front.fromPressedPage(pressedPage, Edition(request)).containers
        val maybeResponse =
          for {
            (container, index) <- containers.zipWithIndex.find(_._1.dataId == collectionId)
            containerLayout <- container.containerLayout}
          yield
            successful{Cached(pressedPage) {
            JsonComponent(views.html.fragments.containers.facia_cards.showMore(containerLayout.remainingCards, index))}}

        maybeResponse getOrElse successful(Cached(60)(NotFound))
      case None => successful(Cached(60)(NotFound))}}


  private object JsonCollection{
    def apply(html: Html)(implicit request: RequestHeader) = JsonComponent(
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
    }.getOrElse(successful(None))

  //this is a very short term solution for the Essential Read AB test. It will be removed afterwards, honest
  private def getFirstXCollections(collectionId: String, take: Int): Future[Option[List[PressedCollection]]] =
    ConfigAgent.getConfigsUsingCollectionId(collectionId).headOption.map { path =>
      frontJsonFapi.get(path).map(_.flatMap{ faciaPage =>
        Some(faciaPage.collections.filterNot(_.displayName contains "sport").take(take))
      })
    }.getOrElse(successful(None))

  /* Google news hits this endpoint */
  def renderCollectionRss(id: String) = MemcachedAction { implicit request =>
    log.info(s"Serving collection ID: $id")
    getPressedCollection(id).flatMap {
      case Some(collection) =>
        successful{
          Cached(60) {
            val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)
            val webTitle = config.displayName.getOrElse("The Guardian")
            Ok(TrailsToRss.fromFaciaContent(webTitle, collection.curatedPlusBackfillDeduplicated, "", None)).as("text/xml; charset=utf8")}
        }
      case None => successful(Cached(60)(NotFound))}
  }


  def renderAgentContents = Action {
    Ok(ConfigAgent.contentsAsJsonString)
  }
}

object FaciaController extends FaciaController {
  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiLive
}

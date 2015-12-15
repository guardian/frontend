package controllers

import com.gu.facia.api.models.{FaciaContent, CuratedContent, CollectionConfig}
import common.FaciaMetrics._
import common._
import implicits.FaciaContentImplicits._
import controllers.front._
import layout.{CollectionEssentials, FaciaContainer, Front}
import model._
import model.facia.PressedCollection
import performance.MemcachedAction
import play.api.libs.json._
import play.api.mvc._
import play.api.templates
import play.twirl.api.Html
import services.{CollectionConfigWithId, ConfigAgent}
import slices._
import views.html.fragments.containers.facia_cards.container
import views.support.TrailCssClasses

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

  def renderSomeFrontContainers(path: String, rawNum: String, rawOffset: String, sectionNameToFilter: String, edition: String) = MemcachedAction { implicit request =>
    def getEditionFromString(edition: String) = {
      val editionToFilterBy = edition match {
        case "international" => "int"
        case _ => edition
      }

      Edition.all.find(_.id.toLowerCase() == editionToFilterBy).getOrElse(Edition.all.head)
    }

    def returnContainers(num: Int, offset: Int) = getSomeCollections(Editionalise(path, getEditionFromString(edition)), num, offset, sectionNameToFilter).map { collections =>
      Cached(60) {
        val containers = collections.getOrElse(List()).zipWithIndex.map { case (collection: PressedCollection, index) =>

          val containerLayout = if(collection.collectionType.contains("mpu")) {
              Fixed(FixedContainers.frontsOnArticles)
            } else {
              Container.resolve(collection.collectionType)
            }

          val containerDefinition = FaciaContainer(
            index,
            containerLayout,
            CollectionConfigWithId("", CollectionConfig.empty),
            CollectionEssentials.fromPressedCollection(collection).copy(treats = Nil)
          )

          container(containerDefinition, FrontProperties.empty)
        }

        if(request.isJson) {
          JsonCollection(Html(containers.mkString))
        } else {
          NotFound
        }
      }
    }

    (rawNum, rawOffset) match {
      case (Int(num), Int(offset)) => returnContainers(num, offset)
      case _ => Future.successful(Cached(600) {
        BadRequest
      })
    }
  }

  def renderSomeFrontContainersMf2(rawNum: String, rawOffset: String, path: String) = MemcachedAction { implicit request =>
    def getEditionFromString(edition: String) = Edition.all.find(_.id.toLowerCase() == "int").getOrElse(Edition.all.head)

    def returnContainers(num: Int, offset: Int) = getSomeCollections("International", num, offset, "none").map { collections =>
      Cached(60) {
        println(collections)
        JsonComponent(
          "items" -> collections.getOrElse(List()).map(getCollection)
        )
      }
    }

    (rawNum, rawOffset) match {
      case (Int(num), Int(offset)) => returnContainers(num, offset)
      case _ => Future.successful(Cached(600) {
        BadRequest
      })
    }
  }

  private def getCollection(pressedCollection: PressedCollection): JsValue = {
    JsObject(
      Json.obj(
        "displayName" -> pressedCollection.displayName,
        "href" -> pressedCollection.href,
        "id" -> pressedCollection.id,
        "content" -> pressedCollection.curatedPlusBackfillDeduplicated.map(isCuratedContent)
      )
      .fields
      .filterNot { case (_, v) => v == JsNull }
    )
  }

  private def isCuratedContent(content: FaciaContent): JsValue = content match {
    case c: CuratedContent => getContent(c)
    case _ => Json.obj()
  }

  private def getContent(content: CuratedContent): JsValue = {
    JsObject(
      Json.obj(
        "headline" -> content.headline,
        "trailText" -> content.trailText,
        "url" -> content.href,
        "thumbnail" -> content.maybeContent.flatMap(_.safeFields.get("thumbnail")),
        "id" -> content.maybeContent.map(_.id),
        "frontPublicationDate" -> content.maybeFrontPublicationDate,
        "byline" -> content.byline,
        "isComment" -> content.isComment,
        "isVideo" -> content.isVideo,
        "isAudio" -> content.isAudio,
        "isGallery" -> content.isGallery,
        "toneClass" -> TrailCssClasses.toneClass(content),
        "showWebPublicationDate" -> false
      )
      .fields
      .filterNot{ case (_, v) => v == JsNull}
    )
  }

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
              Fixed(FixedContainers.fixedSmallSlowVI)
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

  private def getSomeCollections(path: String, num: Int, offset: Int = 0, containerNameToFilter: String): Future[Option[List[PressedCollection]]] =
      frontJsonFapi.get(path).map(_.flatMap{ faciaPage =>
        // To-do: change the filter to only exclude thrashers and empty collections, not items such as the big picture
        Some(faciaPage.collections.filterNot(collection => (collection.curated ++ collection.backfill).length < 2 || collection.displayName == "most popular" || collection.displayName.toLowerCase.contains(containerNameToFilter.toLowerCase)).drop(offset).take(num))
      })

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

object Int {
  def unapply(s : String) : Option[Int] = try {
    Some(s.toInt)
  } catch {
    case _ : java.lang.NumberFormatException => None
  }
}

object FaciaController extends FaciaController {
  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiLive
}

package controllers

import common._
import controllers.front._
import layout.{CollectionEssentials, FaciaContainer, Front}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import model.facia.PressedCollection
import model.pressed.CollectionConfig
import play.api.libs.json._
import play.api.mvc._
import play.twirl.api.Html
import services.{CollectionConfigWithId, ConfigAgent}
import layout.slices._
import views.html.fragments.containers.facia_cards.container
import views.support.FaciaToMicroFormat2Helpers.getCollection
import conf.switches.Switches.InlineEmailStyles

import scala.concurrent.Future
import scala.concurrent.Future.successful

trait FaciaController extends Controller with Logging with ExecutionContexts with implicits.Collections with implicits.Requests {

  val frontJsonFapi: FrontJsonFapi

  implicit val context: ApplicationContext

  private def getEditionFromString(edition: String) = {
    val editionToFilterBy = edition match {
      case "international" => "int"
      case _ => edition
    }
    Edition.all.find(_.id.toLowerCase() == editionToFilterBy).getOrElse(Edition.all.head)
  }

  def applicationsRedirect(path: String)(implicit request: RequestHeader) = {
    successful(InternalRedirect.internalRedirect("applications", path, request.rawQueryStringOption.map("?" + _)))
  }

  def rssRedirect(path: String)(implicit request: RequestHeader) = {
    successful(InternalRedirect.internalRedirect(
      "rss_server",
      path,
      request.rawQueryStringOption.map("?" + _)
    ))
  }

  //Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
  def renderFrontPressSpecial(path: String) = Action.async { implicit request => renderFrontPressResult(path) }

  // Needed as aliases for reverse routing
  def renderFrontJson(id: String) = renderFront(id)

  def renderContainerJson(id: String) = renderContainer(id, false)

  def renderSomeFrontContainersMf2(count: Int, offset: Int, section: String = "", edition: String = "") = Action.async { implicit request =>
    val e = if(edition.isEmpty) Edition(request) else getEditionFromString(edition)
    val collectionsPath = if(section.isEmpty) e.id.toLowerCase else Editionalise(section, e)
    getSomeCollections(collectionsPath, count, offset, "none").map { collections =>
      Cached(CacheTime.Facia) {
        JsonComponent(
          "items" -> JsArray(collections.getOrElse(List()).map(getCollection))
        )
      }
    }

  }

  def renderContainerJsonWithFrontsLayout(id: String) = renderContainer(id, true)

  // Needed as aliases for reverse routing
  def renderRootFrontRss() = renderFrontRss(path = "")
  def renderFrontRss(path: String) = Action.async { implicit  request =>
    log.info(s"Serving RSS Path: $path")
    if (shouldEditionRedirect(path))
      redirectTo(s"${Editionalise(path, Edition(request))}/rss")
    else if (!ConfigAgent.shouldServeFront(path))
      rssRedirect(s"$path/rss")
    else
      renderFrontPressResult(path)
  }

  def rootEditionRedirect() = renderFront(path = "")
  def renderFront(path: String) = Action.async { implicit request =>
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
    Cached(CacheTime.Facia)(WithoutRevalidationResult(Found(LinkTo(s"/$path$params"))))
  }

  def renderFrontJsonLite(path: String) = Action.async { implicit request =>
    frontJsonFapi.get(path).map {
        case Some(pressedPage) => Cached(CacheTime.Facia)(JsonComponent(FapiFrontJsonLite.get(pressedPage)))
        case None => Cached(CacheTime.Facia)(JsonComponent(JsObject(Nil)))}
  }

  private[controllers] def renderFrontPressResult(path: String)(implicit request: RequestHeader) = {
    val futureResult = frontJsonFapi.get(path).flatMap {
      case Some(faciaPage) =>
        successful(
          if (request.isRss) {
            val body = TrailsToRss.fromPressedPage(faciaPage)
            Cached(CacheTime.Facia) {
              RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
            }
          }
          else if (request.isJson)
            Cached(CacheTime.Facia)(JsonFront(faciaPage))
          else if (request.isEmail || ConfigAgent.isEmailFront(path)) {
            val htmlResponse = views.html.frontEmail(faciaPage)
            Cached(CacheTime.Facia) {
              RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse) else htmlResponse)
            }
          }
          else {
            Cached(CacheTime.Facia) {
              RevalidatableResult.Ok(views.html.front(faciaPage))
            }
          }
        )
      case None => successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))}

    futureResult.onFailure { case t: Throwable => log.error(s"Failed rendering $path with $t", t)}
    futureResult
  }

  def renderFrontPress(path: String) = Action.async { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String, preserveLayout: Boolean = false) = Action.async { implicit request =>
    log.info(s"Serving collection ID: $id")
    renderContainerView(id, preserveLayout)
  }

  def renderMostRelevantContainerJson(path: String) = Action.async { implicit request =>
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
            Cached(CacheTime.Facia) {JsonCollection(html)}
          else
            Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound("containers are only available as json")))
      }.getOrElse(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound(s"collection id $collectionId does not exist"))))
    }
  }

  def renderShowMore(path: String, collectionId: String) = Action.async { implicit request =>
    frontJsonFapi.get(path).flatMap {
      case Some(pressedPage) =>
        val containers = Front.fromPressedPage(pressedPage, Edition(request)).containers
        val maybeResponse =
          for {
            (container, index) <- containers.zipWithIndex.find(_._1.dataId == collectionId)
            containerLayout <- container.containerLayout}
          yield
            successful{Cached(CacheTime.Facia) {
            JsonComponent(views.html.fragments.containers.facia_cards.showMore(containerLayout.remainingCards, index))}}

        maybeResponse getOrElse successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
      case None => successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))}}


  private object JsonCollection{
    def apply(html: Html)(implicit request: RequestHeader) = JsonComponent(html)
  }

  private object JsonFront{
    def apply(faciaPage: PressedPage)(implicit request: RequestHeader) = JsonComponent(
      "html" -> views.html.fragments.frontBody(faciaPage),
      "config" -> Json.parse(templates.js.javaScriptConfig(faciaPage).body)
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
        Some(faciaPage.collections.filterNot(collection => (collection.curated ++ collection.backfill).length < 2 || collection.displayName == "most popular" || collection.displayName.toLowerCase.contains(containerNameToFilter.toLowerCase)).slice(offset, offset + num))
      })

  /* Google news hits this endpoint */
  def renderCollectionRss(id: String) = Action.async { implicit request =>
    getPressedCollection(id).flatMap {
      case Some(collection) =>
        successful{
          Cached(CacheTime.Facia) {
            val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)
            val webTitle = config.displayName.getOrElse("The Guardian")
            val body = TrailsToRss.fromFaciaContent(webTitle, collection.curatedPlusBackfillDeduplicated.flatMap(_.properties.maybeContent), "", None)
            RevalidatableResult(Ok(body).as("text/xml; charset=utf8"), body)
          }
        }
      case None => successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))}
  }


  def renderAgentContents = Action {
    Ok(ConfigAgent.contentsAsJsonString)
  }
}

class FaciaControllerImpl(val frontJsonFapi: FrontJsonFapiLive)(implicit val context: ApplicationContext) extends FaciaController


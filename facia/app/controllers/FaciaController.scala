package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._
import play.api.libs.json.Json


abstract class FrontPage(val isNetworkFront: Boolean) extends MetaData

object FrontPage {

  private val fronts = Seq(

    new FrontPage(isNetworkFront = false) {
      override val id = "australia"
      override val section = "australia"
      override val webTitle = "The Guardian"
      override lazy val analyticsName = "GFE:Network Front"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "sport"
      override val section = "sport"
      override val webTitle = "Sport"
      override lazy val analyticsName = "GFE:sport"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Sport",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "money"
      override val section = "money"
      override val webTitle = "Money"
      override lazy val analyticsName = "GFE:money"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Money",
        "content-type" -> "Section",
        "is-front" -> true,
        "is-facia" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "commentisfree"
      override val section = "commentisfree"
      override val webTitle = "Comment is free"
      override lazy val analyticsName = "GFE:commentisfree"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Comment is free",
        "content-type" -> "Section",
        "is-front" -> true,
        "is-facia" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "business"
      override val section = "business"
      override val webTitle = "Business"
      override lazy val analyticsName = "GFE:business"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Business",
        "content-type" -> "Section",
        "is-front" -> true,
        "is-facia" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "culture"
      override val section = "culture"
      override val webTitle = "Culture"
      override lazy val analyticsName = "GFE:culture"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Culture",
        "content-type" -> "Section",
        "is-front" -> true,
        "is-facia" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "film"
      override val section = "film"
      override val webTitle = "Film"
      override lazy val analyticsName = "GFE:film"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Film",
        "content-type" -> "Section",
        "is-front" -> true,
        "is-facia" -> true
      )
    },

    //TODO important this one is last for matching purposes
    new FrontPage(isNetworkFront = true) {
      override val id = ""
      override val section = ""
      override val webTitle = "The Guardian"
      override lazy val analyticsName = "GFE:Network Front"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true,
        "is-facia" -> true
      )
    }
  )

  def apply(path: String): Option[FrontPage] = fronts.find(f => path.endsWith(f.id))

}


class FaciaController extends Controller with Logging with JsonTrails with ExecutionContexts {

  val front: Front = Front
  val EditionalisedKey = """^\w\w(/.*)?$""".r

  private def editionPath(path: String, edition: Edition) = path match {
    case EditionalisedKey(_) => path
    case _ => Editionalise(path, edition)
  }

  // Needed as aliases for reverse routing
  def renderEditionFrontJson(path: String) = renderFront(path)
  def renderEditionFront(path: String) = renderFront(path)
  def renderEditionSectionFrontJson(path: String) = renderFront(path)
  def renderEditionSectionFront(path: String) = renderFront(path)
  def renderFrontJson(path: String) = renderFront(path)
  def renderFront(path: String) = Action { implicit request =>
      val editionalisedPath = editionPath(path, Edition(request))

      FrontPage(editionalisedPath).flatMap { frontPage =>

        // get the trailblocks
        val faciaPageOption: Option[FaciaPage] = front(editionalisedPath)
        faciaPageOption map { faciaPage =>
          if (path != editionalisedPath) {
            LinkTo.redirectWithParameters(request, editionalisedPath)
          } else {
            if (request.isJson) {
              val html = views.html.fragments.frontBody(frontPage, faciaPage)
              JsonComponent(
                "html" -> html,
                "trails" -> faciaPage.collections.filter(_._1.contentApiQuery.isDefined).take(1).flatMap(_._2.items.map(_.url)).toList,
                "config" -> Json.parse(views.html.fragments.javaScriptConfig(frontPage, Switches.all).body)
              )
            }
            else
              Ok(views.html.front(frontPage, faciaPage))
          }
        }
      }.getOrElse(NotFound) //TODO is 404 the right thing here
  }

  def renderTrailsJson(path: String) = renderTrails(path)
  def renderTrails(path: String) = Action { implicit request =>
    val editionalisedPath = editionPath(path, Edition(request))

    FrontPage(editionalisedPath).map{ frontPage =>

      // get the first trailblock
      val collection: Option[(Config, Collection)] = front(editionalisedPath).flatMap(_.collections.filter(_._2.items.nonEmpty).headOption)

      if (path != editionalisedPath) {
        Redirect(editionalisedPath)
      } else {
        val trails: Seq[Trail] = collection.map(_._2.items).getOrElse(Nil)
        val response = () => views.html.fragments.trailblocks.headline(trails, numItemsVisible = trails.size)
        renderFormat(response, response, frontPage)
      }
    }.getOrElse(NotFound)
  }

  def renderResponsiveViewer() = Action {
    Ok(views.html.fragments.responsiveViewer())
  }

}

object FaciaController extends FaciaController

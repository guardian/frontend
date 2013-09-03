package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._

// TODO, this needs a rethink, does not seem elegant

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
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "commentisfree"
      override val section = "commentisfree"
      override val webTitle = "commentisfree"
      override lazy val analyticsName = "GFE:commentisfree"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Comment is free",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "business"
      override val section = "business"
      override val webTitle = "business"
      override lazy val analyticsName = "GFE:business"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Business",
        "content-type" -> "Section",
        "is-front" -> true
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
        "is-front" -> true
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
        "is-front" -> true
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
        "is-front" -> true
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

  def renderFilm() = {
    if (Switches.FilmFrontFacia.isSwitchedOn)
      render("film")
    else
      Action { Ok.withHeaders("X-Accel-Redirect" -> "/redirect/film/film") }
  }

  def render(path: String) = Action { implicit request =>

      val editionalisedPath = editionPath(path, Edition(request))

      FrontPage(editionalisedPath).map { frontPage =>

        // get the trailblocks
        val faciaPage: FaciaPage = front(editionalisedPath)

        if (faciaPage.collections.isEmpty) {
          InternalServerError
        } else {
          val htmlResponse = () => views.html.front(frontPage, faciaPage)
          val jsonResponse = () => views.html.fragments.frontBody(frontPage, faciaPage)
          renderFormat(htmlResponse, jsonResponse, frontPage, Switches.all)
        }
      }.getOrElse(NotFound) //TODO is 404 the right thing here
  }

  def renderTrails(path: String) = Action { implicit request =>

    val editionalisedPath = editionPath(path, Edition(request))

    FrontPage(editionalisedPath).map{ frontPage =>

      // get the first trailblock
      val faciaCollection: Option[(Config, Collection)] = front(editionalisedPath).collections.headOption

      if (faciaCollection.isEmpty) {
        InternalServerError
      } else {
        val trails: Seq[Trail] = faciaCollection.map(_._2.items).getOrElse(Nil)
        val response = () => views.html.fragments.trailblocks.headline(trails, numItemsVisible = trails.size)
        renderFormat(response, response, frontPage)
      }
    }.getOrElse(NotFound)
  }

}

object FaciaController extends FaciaController

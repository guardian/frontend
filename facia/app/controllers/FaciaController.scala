package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._
import scala.Some

// TODO, this needs a rethink, does not seem elegant
object FrontPage {

  private val fronts = Seq(

    new MetaData {
      override val canonicalUrl = Some("http://www.guardian.co.uk/australia")
      override val id = "australia"
      override val section = "australia"
      override val webTitle = "The Guardian"
      override lazy val analyticsName = "GFE:Network Front"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    },

    new MetaData {
      override val canonicalUrl = Some("http://www.guardian.co.uk/sport")
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

    new MetaData {
      override val canonicalUrl = Some("http://www.guardian.co.uk/culture")
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

    //TODO important this one is last for matching purposes
    new MetaData {
      override val canonicalUrl = Some("http://www.guardian.co.uk")
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

  def apply(path: String): Option[MetaData] = fronts.find(f => path.startsWith(f.id))

}


class FaciaController extends Controller with Logging with JsonTrails with ExecutionContexts {

  val EditionalisedKey = """(.*\w\w-edition)""".r
  val FrontPath = """(\w\w-edition)?""".r

  val front: Front = Front

  private def editionPath(path: String, edition: Edition) = path match {
    case EditionalisedKey(_) => path
    case _ => Editionalise(path, edition)
  }

  def render(path: String) = Action { implicit request =>

    if (Switches.FilmFrontFacia.isSwitchedOn) {
      // TODO - just using realPath while we are in the transition state. Will not be necessary after www.theguardian.com
      // go live
      val realPath = editionPath(path, Edition(request))

      FrontPage(realPath).map { frontPage =>

        // get the trailblocks
        val trailblocks: Seq[Trailblock] = front(realPath)

        if (trailblocks.isEmpty) {
          InternalServerError
        } else {
          val htmlResponse = () => views.html.front(frontPage, trailblocks)
          val jsonResponse = () => views.html.fragments.frontBody(frontPage, trailblocks)
          renderFormat(htmlResponse, jsonResponse, frontPage, Switches.all)
        }
      }.getOrElse(NotFound) //TODO is 404 the right thing here
    }
    else
      Ok.withHeaders("X-Accel-Redirect" -> "/redirect/film")
  }

  def renderTrails(path: String) = Action { implicit request =>

    val realPath = editionPath(path, Edition(request))

    FrontPage(realPath).map{ frontPage =>
      // get the first trailblock
      val trailblock: Option[Trailblock] = front(realPath).headOption

      if (trailblock.isEmpty) {
        InternalServerError
      } else {
        val trails: Seq[Trail] = trailblock.map(_.trails).getOrElse(Nil)
        val response = () => views.html.fragments.trailblocks.headline(trails, numItemsVisible = trails.size)
        renderFormat(response, response, frontPage)
      }
    }.getOrElse(NotFound)
  }

}

object FaciaController extends FaciaController

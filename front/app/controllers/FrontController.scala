package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._
import model.Trailblock
import play.api.libs.json._
import concurrent.Future


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

  def apply(path: String): Option[FrontPage] = fronts.find(f => path.startsWith(f.id))

}


class FrontController extends Controller with Logging with JsonTrails with ExecutionContexts {

  val EditionalisedKey = """(.*\w\w-edition)""".r
  val FrontPath = """(\w\w-edition|\w\w)?""".r

  // TODO - disappears after www.theguardian.com
  val BackwardsCompatiblePath = """([\w\d-]*)/?(\w\w)-edition""".r

  val front: Front = Front

  private def editionPath(path: String, edition: Edition) = path match {
    case BackwardsCompatiblePath(id, edition) => Seq(edition, id).filter(_.nonEmpty).mkString("/")
    case EditionalisedKey(_) => path
    case _ => Editionalise(path, edition)
  }

  private def faciaRedirect(path: String, request: RequestHeader) =
    request.headers.get("X-Gu-Facia")
      .filter(Switches.FaciaSwitch.isSwitchedOn && _ == "true" && path.nonEmpty)
      .map {_ => Ok.withHeaders("X-Accel-Redirect" -> s"/redirect/facia/$path")}

  def render(path: String) = Action { implicit request =>

    faciaRedirect(path, request) getOrElse {

      // TODO - just using realPath while we are in the transition state. Will not be necessary after www.theguardian.com
      // go live
      val realPath = editionPath(path, Edition(request))

      // TODO - needed till after www.theguardian.com
      val pageId = realPath.drop(3)  //removes the edition


      FrontPage(pageId).map { frontPage =>

      // get the trailblocks
        val trailblocks: Seq[Trailblock] = front(realPath).filterNot { trailblock =>

        // TODO this must die, configured trailblock should not be in there in the first place if we don't want it.......
        // filter out configured trailblocks if not on the network front
          path match {
            case FrontPath(_) => false
            case _ => trailblock.description.isConfigured
          }
        }

        if (path != realPath) {
          redirectWithParameters(request, realPath)
        } else if (trailblocks.isEmpty) {
          InternalServerError
        } else {
          Cached(frontPage){
            if (request.isJson)
              JsonComponent(
                "html" -> views.html.fragments.frontBody(frontPage, trailblocks),
                "trails" -> trailblocks.headOption.map{ trailblock =>
                  trailblock.trails.map(_.url)
                }.getOrElse(Nil),
                "config" -> Json.parse(views.html.fragments.javaScriptConfig(frontPage, Switches.all).body)
              )
            else
              Ok(views.html.front(frontPage, trailblocks))
          }
        }

      }.getOrElse(NotFound) //TODO is 404 the right thing here
    }
  }

  private def redirectWithParameters(request: Request[AnyContent], realPath: String): SimpleResult[Results.EmptyContent] = {
    val params = if (request.hasParameters) s"?${request.rawQueryString}" else ""
    Redirect(request.path.endsWith(".json") match {
      case true => s"/$realPath.json$params"
      case _ => s"/$realPath$params"
    })
  }

  def renderTrails(path: String) = Action { implicit request =>

    faciaRedirect(path, request) getOrElse {

      val realPath = editionPath(path, Edition(request))

      FrontPage(realPath).map{ frontPage =>
        // get the first trailblock
        val trailblock: Option[Trailblock] = front(realPath).headOption

        if (trailblock.isEmpty) {
          InternalServerError
        } else {
          val trails: Seq[Trail] = trailblock.get.trails
          val response = () => views.html.fragments.trailblocks.headline(trails, numItemsVisible = trails.size)
          renderFormat(response, response, frontPage)
        }
      }.getOrElse(NotFound)
    }
  }

}

object FrontController extends FrontController

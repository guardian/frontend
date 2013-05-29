package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._
import model.Trailblock
import scala.Some

import concurrent.Future

object NetworkFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk")
  override val id = ""
  override val section = ""
  override val webTitle = "The Guardian"
  override lazy val analyticsName = "GFE:Network Front"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "content-type" -> "Network Front"
  )
}

object AustraliaNetworkFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk/australia")
  override val id = "australia"
  override val section = "australia"
  override val webTitle = "The Guardian"
  override lazy val analyticsName = "GFE:Network Front"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "content-type" -> "Network Front"
  )
}

object SportFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk/sport")
  override val id = "sport"
  override val section = "sport"
  override val webTitle = "Sport"
  override lazy val analyticsName = "GFE:sport"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "Sport",
    "content-type" -> "Section"
  )
}

object CultureFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk/culture")
  override val id = "culture"
  override val section = "culture"
  override val webTitle = "Culture"
  override lazy val analyticsName = "GFE:culture"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "Culture",
    "content-type" -> "Section"
  )
}


class FrontController extends Controller with Logging with JsonTrails with ExecutionContexts {

  val front: Front = Front

  def warmup() = Action {
    val promiseOfWarmup = Future(Front.warmup)
    Async {
      promiseOfWarmup.map(warm => Ok("warm"))
    }
  }

  def isUp() = Action {
    Ok("Ok")
  }
  
  def render(path: String) = Action { implicit request =>

    val edition = Edition(request)

    val frontPage: MetaData = path match {
      case "front" => NetworkFrontPage
      case "australia" => AustraliaNetworkFrontPage
      case "sport" => SportFrontPage
      case "culture" => CultureFrontPage
    }

    // get the trailblocks
    val trailblocks: Seq[Trailblock] = front(path, edition).filterNot{ trailblock =>
      // filter out configured trailblocks if not on the network front
      path match {
        case "front" => false
        case _ => trailblock.description.isConfigured
      }
    }

    if (trailblocks.isEmpty) {
      InternalServerError
    } else {
      val htmlResponse = () => views.html.front(frontPage, trailblocks)
      val jsonResponse = () => views.html.fragments.frontBody(frontPage, trailblocks)
      renderFormat(htmlResponse, jsonResponse, frontPage, Switches.all)
    }
  }
  
  def renderTrails(path: String) = Action { implicit request =>

    val edition = Edition(request)

    val frontPage: MetaData = path match {
      case "front" => NetworkFrontPage
      case "australia" => AustraliaNetworkFrontPage
      case "sport" => SportFrontPage
      case "culture" => CultureFrontPage
    }

    // get the first trailblock
    val trailblock: Option[Trailblock] = front(path, edition).headOption

    if (trailblock.isEmpty) {
      InternalServerError
    } else {
      val trails: Seq[Trail] = trailblock.get.trails
      val response = () => views.html.fragments.trailblocks.headline(trails, numItemsVisible = trails.size)
      renderFormat(response, response, frontPage)
    }
  }

}

object FrontController extends FrontController

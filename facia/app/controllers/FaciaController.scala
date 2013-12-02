package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._
import play.api.libs.json.{JsArray, Json}
import Switches.EditionRedirectLoggingSwitch
import views.support.NewsContainer


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
      override val webTitle = "Comment is free"
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
      override val webTitle = "Business"
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

    new FrontPage(isNetworkFront = false) {
      override val id = "football"
      override val section = "football"
      override val webTitle = "Football"
      override lazy val analyticsName = "GFE:football"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Football",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "technology"
      override val section = "technology"
      override val webTitle = "Technology"
      override lazy val analyticsName = "GFE:technology"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Technology",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "travel"
      override val section = "travel"
      override val webTitle = "Travel"
      override lazy val analyticsName = "GFE:travel"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Travel",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "world/nsa"
      override val section = "world"
      override val webTitle = "NSA"
      override lazy val analyticsName = "GFE:world/nsa"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "NSA",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "world/edward-snowden"
      override val section = "world"
      override val webTitle = "Edward Snowden"
      override lazy val analyticsName = "GFE:world/edward-snowden"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Edward Snowden",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "football/arsenal"
      override val section = "football"
      override val webTitle = "Arsenal"
      override lazy val analyticsName = "GFE:football/arsenal"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Arsenal",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "artanddesign/photography"
      override val section = "artanddesign"
      override val webTitle = "Photography"
      override lazy val analyticsName = "GFE:artanddesign/photography"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Photography",
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


  def editionRedirect(path: String) = Action{ implicit request =>

    val edition = Edition(request)
    val editionBase = s"/${edition.id.toLowerCase}"

    val redirectPath = path match {
      case "" => editionBase
      case sectionFront => s"$editionBase/$sectionFront"
    }

    if (EditionRedirectLoggingSwitch.isSwitchedOn) {
      val country = request.headers.get("X-GU-GeoLocation").getOrElse("not set")
      val editionCookie = request.headers.get("X-GU-Edition-From-Cookie").getOrElse("false")

      log.info(s"Edition redirect: geolocation: $country | edition: ${edition.id} | edition cookie set: $editionCookie"  )
    }

    NoCache(Redirect(redirectPath))
  }

  // Needed as aliases for reverse routing
  def renderEditionFrontJson(path: String) = renderFront(path)
  def renderEditionFront(path: String) = renderFront(path)
  def renderEditionSectionFrontJson(path: String) = renderFront(path)
  def renderEditionSectionFront(path: String) = renderFront(path)
  def renderArbitraryFront(path: String) = renderFront(path)
  def renderFrontJson(path: String) = renderFront(path)

  def renderEditionCollection(id: String) = renderCollection(id)
  def renderEditionCollectionJson(id: String) = renderCollection(id)

  def renderFront(path: String) = Action { implicit request =>
      val editionalisedPath = editionPath(path, Edition(request))

      FrontPage(editionalisedPath).flatMap { frontPage =>

        // get the trailblocks
        val faciaPageOption: Option[FaciaPage] = front(editionalisedPath)
        faciaPageOption map { faciaPage =>
          Cached(frontPage) {
            if (request.isJson) {
              val html = views.html.fragments.frontBody(frontPage, faciaPage)
              JsonComponent(
                "html" -> html,
                "trails" -> JsArray(faciaPage.collections.filter(_._1.contentApiQuery.isDefined).take(1).flatMap(_._2.items.map(TrailToJson(_)))),
                "config" -> Json.parse(views.html.fragments.javaScriptConfig(frontPage).body)
              )
            }
            else
              Ok(views.html.front(frontPage, faciaPage))
          }
        }
      }.getOrElse(NotFound) //TODO is 404 the right thing here
  }

  def renderCollection(id: String) = Action { implicit request =>
    CollectionAgent.getCollection(id) map { collection =>
      val html = views.html.fragments.collections.standard(Config(id, None, None, None), collection, NewsContainer(true, true), 1)
      Cached(60) {
        if (request.isJson) {
            JsonComponent(
              "html" -> html,
              "trails" -> JsArray(collection.items.map(TrailToJson(_)))
            )
        } else {
          Ok(html)
        }
      }
    } getOrElse(NotFound)
  }
}

object FaciaController extends FaciaController

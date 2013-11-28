package controllers

import common._
import front._
import model._
import conf._
import play.api.mvc._
import play.api.libs.json.{JsArray, Json}
import Switches.EditionRedirectLoggingSwitch
import com.sun.syndication.feed.synd._;
import com.sun.syndication.io.{FeedException, SyndFeedOutput}
import java.io.IOException;
import java.io.StringWriter;
 
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
  
  def renderCollectionRss(path: String) = Action { implicit request =>

    val feed = new SyndFeedImpl();
    feed.setFeedType("rss_2.0");
    feed.setTitle("rss_2.0");
    feed.setDescription("Updates for Hike Uber Tracks - ");
    feed.setLink("...");

    val writer = new StringWriter();
    val output = new SyndFeedOutput()
    output.output(feed, writer);
    writer.close

    Ok(writer.toString).as("application/rss+xml");
  }


  // Needed as aliases for reverse routing
  def renderEditionFrontJson(path: String) = renderFront(path)
  def renderEditionFront(path: String) = renderFront(path)
  def renderEditionSectionFrontJson(path: String) = renderFront(path)
  def renderEditionSectionFront(path: String) = renderFront(path)
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
    val pathOption = request.queryString("path").headOption

    pathOption.map { path =>

      val editionalisedPath = editionPath(path, Edition(request))

      FrontPage(editionalisedPath).flatMap { frontPage =>

      // get the trailblocks
        val faciaPageOption: Option[FaciaPage] = front(editionalisedPath)
        faciaPageOption map { faciaPage =>
          Cached(frontPage) {
            if (request.isJson) {
              val collection = faciaPage.copy(collections = faciaPage.collections.filter(t => t._1.id == id))
              val html = views.html.fragments.frontBody(frontPage, collection)
              JsonComponent(
                "html" -> html,
                "trails" -> JsArray(collection.collections.flatMap(_._2.items.map(TrailToJson(_))))
              )
            }
            else
              Ok(views.html.front(frontPage, faciaPage))
          }
        }
      }.getOrElse(NotFound) //TODO is 404 the right thing here

    }.getOrElse(NotFound)
  }

  def renderResponsiveViewer() = Action {
    Cached(60) {
      Ok(views.html.fragments.responsiveViewer())
    }
  }

}

object FaciaController extends FaciaController

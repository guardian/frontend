package controllers

import common._
import play.api.mvc._
import services.{Archive, DynamoDB, Googlebot404Count}
import java.net.URLDecoder
import model.Cached


object ArchiveController extends Controller with Logging with ExecutionContexts {

  private val R1ArtifactUrl = """www.theguardian.com/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
  private val PathPattern = s"""www.theguardian.com/([\\w\\d-]+)/(.*)""".r
  private val GoogleBot = """.*(Googlebot).*""".r

  def lookup(path: String) = Action.async{ implicit request =>

    // lookup the path to see if we have a location for it in the database
    lookupPath(path).map(_.getOrElse{

      // if we do not have a location in the database then follow these rules
      path match {
        case Decoded(decodedPath) => redirectTo(decodedPath)
        case Gallery(gallery)     => redirectTo(gallery)
        case Century(century)     => redirectTo(century)
        case Lowercase(lower)     => redirectTo(lower)

        case _ =>
          log404(request)
          // short cache time as we might just be waiting for the content api to index
          Cached(10)(NotFound(views.html.notFound()))
      }
    })
  }

  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html
  def normalise(path: String, zeros: String = ""): Option[String] = {
    path match {
      case R1ArtifactUrl(path, artifactOrContextId, extension) =>
        val normalisedUrl = s"www.theguardian.com/$path/0,,$artifactOrContextId,$zeros.html"
        Some(normalisedUrl)
      case _ => None
    }
  }

  def linksToItself(path: String, destination: String): Boolean = path match {
    case PathPattern(_, r1path) => destination contains r1path
    case _ => false
  }
 
  private def destinationFor(path: String) = DynamoDB.destinationFor(path).map(_.filterNot { destination =>
      linksToItself(path, destination.location)
  })

  private object Decoded {
    def unapply(path: String): Option[String] = {
        val decodedPath = URLDecoder.decode(path, "UTF-8").replace(" ", "+") // the + is for combiner pages
        if (decodedPath != path) Some(decodedPath) else None
    }
  }

  private object Gallery {
    def unapply(path: String): Option[String] =
      if (path contains "/gallery/") Some(path.replace("/gallery/", "/pictures/")) else None
  }

  private object Century {
    private val CenturyUrlEx = """www.theguardian.com\/century(\/)?$""".r
    private val CenturyDecadeUrlEx = """www.theguardian.com(\/\d{4}-\d{4})(\/)?$""".r
    private val CenturyStoryUrlEx = """www.theguardian.com\/(\d{4}-\d{4})\/Story\/([0|1]?,[\d]*,-?\d+,[\d]*)(.*)""".r
    private val ngCenturyFront = "www.theguardian.com/world/2014/jul/31/-sp-how-the-guardian-covered-the-20th-century"

    def unapply(path: String): Option[String] = {
      path match {
        case CenturyUrlEx(_) => Some(ngCenturyFront)
        case CenturyDecadeUrlEx(_, _) => Some(ngCenturyFront)
        case CenturyStoryUrlEx(decade, storyId, ext) => Some(s"www.theguardian.com/century/$decade/Story/$storyId$ext")
        case _ =>  None
      }
    }
  }

  private object Lowercase {
    def unapply(path: String): Option[String] = path.split("/").toList match {
        case "www.theguardian.com" :: section :: other if section.exists(_.isUpper) =>
          Some(s"www.theguardian.com/${section.toLowerCase}/${other.mkString("/")}")
        case _ => None
    }
  }

  private def redirectTo(path: String)(implicit request: RequestHeader): Result = {
    log.info(s"301,${RequestLog(request)}")
    Cached(300)(Redirect(s"http://$path", 301))
  }

  private def logDestination(path: String, msg: String, destination: String) {
    log.info(s"Destination: $msg : $path -> $destination")
  }

  private def log404(request: Request[AnyContent]) =
    request.headers.get("User-Agent").getOrElse("no user agent") match {
      case GoogleBot(_) =>
        log.warn(s"404,${RequestLog(request)}")
        Googlebot404Count.increment()
      case _ =>
        log.info(s"404,${RequestLog(request)}")
    }

  private def lookupPath(path: String) = destinationFor(s"http://${normalise(path).getOrElse(path)}").map { _.map {
    case services.Redirect(url) =>
      logDestination(path, "redirect", url)
      Cached(300)(Redirect(url, 301))
    case Archive(archivePath) =>
      // http://wiki.nginx.org/X-accel
      logDestination(path, "archive", archivePath)
      Cached(300)(Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/$archivePath"))
  }}

}

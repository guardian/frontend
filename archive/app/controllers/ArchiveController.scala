package controllers

import campaigns.ShortCampaignCodes
import common._
import play.api.mvc._
import services.{Archive, DynamoDB, Googlebot404Count, Destination}
import java.net.URLDecoder
import model.Cached
import scala.concurrent.Future
import conf.switches.Switches.ArchiveResolvesR1UrlsInRedirectTableSwitch

object ArchiveController extends Controller with Logging with ExecutionContexts {

  private val R1ArtifactUrl = """www.theguardian.com/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
  private val ShortUrl = """^(www\.theguardian\.com/p/[\w\d]+).*$""".r
  private val R1Redirect = """www\.theguardian\.com/[\w\d-]+(.*/[0|1]?,[\d]*,-?\d+,[\d]*.*)""".r
  private val GoogleBot = """.*(Googlebot).*""".r
  private val CombinerSection = """^(www.theguardian.com/[\w\d-]+)[\w\d-/]*\+[\w\d-/]+$""".r
  private val CombinerSectionRss = """^(www.theguardian.com/[\w\d-]+)[\w\d-/]*\+[\w\d-/]+/rss$""".r
  private val Guardian = """^www.theguardian.com/Guardian/(.*)$""".r
  private val DatedSpecialIndexPage = """^www.theguardian.com(/[\w\d-]+)(/.*)/(week|lead)$""".r
  private val SectionSpecialIndex = """^www.theguardian.com(/[\w\d-]+)/(week|lead)$""".r
  private val NewspaperPage = "^www.theguardian.com(/theguardian|/theobserver)/(\\d{4}/\\w{3}/\\d{2})/(.+)".r

  def lookup(path: String) = Action.async{ implicit request =>

    // lookup the path to see if we have a location for it in the database
    lookupPath(path).map(_.getOrElse{

      // if we do not have a location in the database then follow these rules
      path match {
        case Gallery(gallery)                 => redirectTo(gallery, "gallery")
        case Century(century)                 => redirectTo(century, "century")
        case Guardian(endOfUrl)               => redirectTo(s"www.theguardian.com/$endOfUrl", "guardian")
        case Lowercase(lower)                 => redirectTo(lower, "lowercase")

        // Googlebot hits a bunch of really old combiners and combiner RSS
        // bounce these to the section
        case CombinerSectionRss(section)      => redirectTo(s"$section/rss", "combinerrss")
        case CombinerSection(section)         => redirectTo(section, "combinersection")
        case Combiner(combiner)               => redirectTo(combiner, "combiner")
        case DatedSpecialIndexPage(section, rest, _) => Cached(300)(Redirect(s"${LinkTo(section)}$rest/all", 301))
        case SectionSpecialIndex(section, _)  => Cached(300)(Redirect(s"${LinkTo(section)}/all", 301))
        case NewspaperPage(paper, date, book)       =>  Cached(300)(Redirect(s"${LinkTo(paper)}/$book/$date/all", 301))

          // edge cache test
        case "automated-test/strict-transport-security" => Cached(300)(Ok("<h1>test</h1>").withHeaders("Strict-Transport-Security" -> "max-age=0", "X-Test-Response" -> "true"))

        case _ =>
          log404(request)
          // short cache time as we might just be waiting for the content api to index
          Cached(10)(NotFound(views.html.notFound()))
      }
    })
  }

  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html
  def normalise(path: String, zeros: String = ""): String = {
    val normalised = path match {
      case R1ArtifactUrl(path, artifactOrContextId, extension) if ArchiveResolvesR1UrlsInRedirectTableSwitch.isSwitchedOff =>
        val normalisedUrl = s"www.theguardian.com/$path/0,,$artifactOrContextId,$zeros.html"
        Some(normalisedUrl)
      case ShortUrl(path) =>
        Some(path)
      case _ => None
    }
    s"http://${normalised.getOrElse(path)}"
  }

  def linksToItself(path: String, destination: String): Boolean = path match {
    case R1Redirect(r1path) => destination.endsWith(r1path)
    case _ => false
  }

  def retainShortUrlCampaign(path: String, redirectLocation: String ): String = {
    // if the path is a short url with a campaign, and the destination doesn't have a campaign, pass it through the redirect.
    val shortUrlWithCampaign = """.*www\.theguardian\.com/p/[\w\d]+/([\w\d]+)$""".r
    val urlWithCampaignParam = """.*www\.theguardian\.com.*?.*CMP=.*$""".r

    val destinationHasCampaign = redirectLocation match {
      case shortUrlWithCampaign(_) => true
      case urlWithCampaignParam() => true
      case _ => false
    }

    path match {
      case shortUrlWithCampaign(campaign) if !destinationHasCampaign => {
        val uri = javax.ws.rs.core.UriBuilder.fromPath(redirectLocation)
        ShortCampaignCodes.getFullCampaign(campaign).foreach(uri.replaceQueryParam("CMP", _))
        uri.build().toString
      }
      case _ => redirectLocation
    }
  }

  private def destinationFor(path: String): Future[Option[Destination]] = DynamoDB.destinationFor(normalise(path))

  private object Combiner {
    def unapply(path: String): Option[String] = {
        val decodedPath = URLDecoder.decode(path, "UTF-8")
        val combinerPath = decodedPath.replace(" ", "+") // the + is for combiner pages
        if (combinerPath != decodedPath && combinerPath != path) Some(combinerPath) else None
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

  private def redirectTo(path: String, identifier: String)(implicit request: RequestHeader): Result = {
    log.info(s"301, $identifier, ${RequestLog(request)}")
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

  private def lookupPath(path: String) = destinationFor(path).map{ _.flatMap(processLookupDestination(path).lift)}

  def processLookupDestination(path: String) : PartialFunction[Destination, Result] = {
      case services.Redirect(location) if !linksToItself(path, location) =>
        val locationWithCampaign = retainShortUrlCampaign(path, location)
        logDestination(path, "redirect", locationWithCampaign)
        Cached(300)(Redirect(locationWithCampaign, 301))
      case Archive(archivePath) =>
        // http://wiki.nginx.org/X-accel
        logDestination(path, "archive", archivePath)
        Cached(300)(Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/$archivePath"))
  }

}

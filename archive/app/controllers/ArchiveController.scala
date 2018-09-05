package controllers

import commercial.campaigns.ShortCampaignCodes
import common._
import model.Cached.{CacheableResult, WithoutRevalidationResult}
import play.api.mvc._
import services.{GoogleBotMetric, RedirectService}
import java.net.URLDecoder
import java.util.concurrent.atomic.AtomicReference
import javax.ws.rs.core.UriBuilder

import conf.Configuration
import experiments._
import model.{CacheTime, Cached}
import org.apache.http.HttpStatus
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.twirl.api.Html
import services.RedirectService.{ArchiveRedirect, Destination, PermanentRedirect}

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import java.lang.System.currentTimeMillis

import metrics.TimingMetric

class ArchiveController(redirects: RedirectService, val controllerComponents: ControllerComponents, ws: WSClient) extends BaseController with Logging with ImplicitControllerExecutionContext {

  private val R1ArtifactUrl = """^/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
  private val ShortUrl = """^(/p/[\w\d]+).*$""".r
  private val R1Redirect = """^/[\w\d-]+(.*/[0|1]?,[\d]*,-?\d+,[\d]*.*)""".r
  private val CombinerSection = """^(/[\w\d-]+)[\w\d-/]*\+[\w\d-/]+$""".r
  private val CombinerSectionRss = """^(/[\w\d-]+)[\w\d-/]*\+[\w\d-/]+/rss$""".r
  private val Guardian = """^/Guardian(/.*)$""".r
  private val DatedSpecialIndexPage = """^(/[\w\d-]+)/(.*)/(week|lead)$""".r
  private val SectionSpecialIndex = """^(/[\w\d-]+)/(week|lead)$""".r
  private val NewspaperPage = "^(/theguardian|/theobserver)/(\\d{4}/\\w{3}/\\d{2})/(.+)".r

  private val redirectHttpStatus = HttpStatus.SC_MOVED_PERMANENTLY

  def getLocal404Page(implicit request: RequestHeader): Future[Result] = Future {
    Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound(views.html.notFound())))
  }

  def lookup(path: String): Action[AnyContent] = Action.async { implicit request =>
    lookupPath(path)
      .map { _
        .map(Cached(CacheTime.ArchiveRedirect))
        .orElse(redirectForPath(path))
      }
      .flatMap(_.map(Future.successful).getOrElse(getLocal404Page))
  }

  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html
  def normalise(path: String, zeros: String = ""): String = path match {
    case R1ArtifactUrl(p, artifactOrContextId, extension) =>
      s"/$p/0,,$artifactOrContextId,$zeros.html"
    case ShortUrl(p) => p
    case _ => path
  }

  def linksToItself(path: String, destination: String): Boolean = path match {
    case R1Redirect(r1path) => destination.endsWith(r1path)
    case _ => false
  }

  def retainShortUrlCampaign(path: String, redirectLocation: String): String = {
    // if the path is a short url with a campaign, and the destination doesn't have a campaign, pass it through the redirect.
    val shortUrlWithCampaign = """.*www\.theguardian\.com/p/[\w\d]+/([\w\d]+)$""".r
    val urlWithCampaignParam = """.*www\.theguardian\.com.*?.*CMP=.*$""".r

    val destinationHasCampaign = redirectLocation match {
      case shortUrlWithCampaign(_) => true
      case urlWithCampaignParam() => true
      case _ => false
    }

    path match {
      case shortUrlWithCampaign(campaign) if !destinationHasCampaign =>
        val uri = UriBuilder.fromPath(redirectLocation)
        ShortCampaignCodes.getFullCampaign(campaign).foreach(uri.replaceQueryParam("CMP", _))
        uri.build().toString
      case _ => redirectLocation
    }
  }

  private def destinationFor(path: String): Future[Option[Destination]] = {
    redirects.getDestination(normalise(path))
  }

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
    private val CenturyUrlEx = """/century(\/)?$""".r
    private val CenturyDecadeUrlEx = """(\/\d{4}-\d{4})(\/)?$""".r
    private val CenturyStoryUrlEx = """\/(\d{4}-\d{4})\/Story\/([0|1]?,[\d]*,-?\d+,[\d]*)(.*)""".r
    private val ngCenturyFront = "/world/2014/jul/31/-sp-how-the-guardian-covered-the-20th-century"

    def unapply(path: String): Option[String] = path match {
      case CenturyUrlEx(_) => Some(ngCenturyFront)
      case CenturyDecadeUrlEx(_, _) => Some(ngCenturyFront)
      case CenturyStoryUrlEx(decade, storyId, ext) => Some(s"/century/$decade/Story/$storyId$ext")
      case _ =>  None
    }
  }

  private object Lowercase {
    def unapply(path: String): Option[String] = path.split("/").toList match {
        case "" :: section :: other if section.exists(_.isUpper) =>
          Some(s"/${section.toLowerCase}/${other.mkString("/")}")
        case _ => None
    }
  }

  private def redirectTo(path: String, pathSuffixes: String*)(implicit request: RequestHeader): Result = {
    val endOfPath = if(pathSuffixes.isEmpty) "" else s"/${pathSuffixes.mkString("/")}"
    val redirect = LinkTo(path) + endOfPath

    log.info(s"""Archive $redirectHttpStatus, redirect to $redirect""")
    Cached(CacheTime.ArchiveRedirect)(WithoutRevalidationResult(Redirect(redirect, redirectHttpStatus)))
  }


  private def log404(request: Request[AnyContent]) = {
    log.warn(s"Archive returned 404 for path: ${request.path}")

    val GoogleBot = """.*(Googlebot).*""".r
    request.headers.get("User-Agent").getOrElse("no user agent") match {
      case GoogleBot(_) => GoogleBotMetric.Googlebot404Count.increment()
      case _ =>
    }
  }

  private def lookupPath(path: String)(implicit request: RequestHeader): Future[Option[CacheableResult]] = destinationFor(path).map{ _.flatMap(processLookupDestination(path).lift) }

  private def redirectForPath(path: String)(implicit request: RequestHeader): Option[Result] = path match {
      case Gallery(gallery)      => Some(redirectTo(gallery))
      case Century(century)      => Some(redirectTo(century))
      case Guardian(endOfUrl)    => Some(redirectTo(endOfUrl))
      case Lowercase(lower)      => Some(redirectTo(lower))

      // Googlebot hits a bunch of really old combiners and combiner RSS
      // bounce these to the section
      case CombinerSectionRss(section)                => Some(redirectTo(s"$section/rss"))
      case CombinerSection(section)                   => Some(redirectTo(section))
      case Combiner(combiner)                         => Some(redirectTo(combiner))
      case DatedSpecialIndexPage(section, rest, _)    => Some(redirectTo(section, rest, "all"))
      case SectionSpecialIndex(section, _)            => Some(redirectTo(section, "all"))
      case NewspaperPage(paper, date, book)           => Some(redirectTo(paper, book, date, "all"))
      case _ => None
  }

  def processLookupDestination(path: String)(implicit request: RequestHeader) : PartialFunction[Destination, CacheableResult] = {
      case PermanentRedirect(_, location) if !linksToItself(path, location) =>
        val locationWithCampaign = retainShortUrlCampaign(path, location)
        WithoutRevalidationResult(Redirect(LinkTo(locationWithCampaign), redirectHttpStatus))
      case ArchiveRedirect(_, archivePath) =>
        // http://wiki.nginx.org/X-accel
        WithoutRevalidationResult(Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/$archivePath"))
  }

}

package implicits

import com.gu.facia.client.models.{
  EU27Territory,
  NZTerritory,
  TargetedTerritory,
  USEastCoastTerritory,
  USWestCoastTerritory,
  AUVictoriaTerritory,
  AUQueenslandTerritory,
  AUNewSouthWalesTerritory,
}
import conf.Configuration
import play.api.mvc.RequestHeader

sealed trait RequestFormat
case object HtmlFormat extends RequestFormat
case object JsonFormat extends RequestFormat
case object EmailFormat extends RequestFormat
case object AmpFormat extends RequestFormat
case class TerritoryHeader(territory: TargetedTerritory, headerString: String)

object GUHeaders {
  val TERRITORY_HEADER = "X-GU-Territory"
}

trait Requests {

  val EMAIL_SUFFIX = "/email"
  val HEADLINE_SUFFIX = "/headline.txt"
  val EMAIL_JSON_SUFFIX = ".emailjson"
  val EMAIL_TXT_SUFFIX = ".emailtxt"
  val territoryHeaders: List[TerritoryHeader] = List(
    TerritoryHeader(EU27Territory, EU27Territory.id),
    TerritoryHeader(NZTerritory, NZTerritory.id),
    TerritoryHeader(USEastCoastTerritory, USEastCoastTerritory.id),
    TerritoryHeader(USWestCoastTerritory, USWestCoastTerritory.id),
    TerritoryHeader(AUVictoriaTerritory, AUVictoriaTerritory.id),
    TerritoryHeader(AUQueenslandTerritory, AUQueenslandTerritory.id),
    TerritoryHeader(AUNewSouthWalesTerritory, AUNewSouthWalesTerritory.id),
  )

  implicit class RichRequestHeader(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getParameters(name: String): Seq[String] = r.queryString.getOrElse(name, Nil)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    def getRequestFormat: RequestFormat =
      if (isJson) JsonFormat else if (isEmail) EmailFormat else if (isAmp) AmpFormat else HtmlFormat

    lazy val isJson: Boolean = r.getQueryString("callback").isDefined || r.path.endsWith(".json")

    lazy val isEmailJson: Boolean = r.path.endsWith(EMAIL_JSON_SUFFIX)

    lazy val isEmailTxt: Boolean = r.path.endsWith(EMAIL_TXT_SUFFIX)

    lazy val isLazyLoad: Boolean =
      r.getQueryString("lazy-load").isDefined && !r.getQueryString("lazy-load").contains("false")

    lazy val isRss: Boolean = r.path.endsWith("/rss")

    lazy val isAmp: Boolean = r.getQueryString("amp").isDefined || (!r.host.isEmpty && r.host == Configuration.amp.host)

    lazy val isEmail: Boolean = r.getQueryString("format").exists(_.contains("email")) || r.path.endsWith(
      EMAIL_SUFFIX,
    ) || isEmailJson || isEmailTxt

    lazy val isHeadlineText: Boolean =
      r.getQueryString("format").contains("email-headline") || r.path.endsWith(HEADLINE_SUFFIX)

    lazy val isModified = isJson || isRss || isEmail || isHeadlineText

    lazy val pathWithoutModifiers: String =
      if (isEmail) r.path.stripSuffix(EMAIL_SUFFIX)
      else r.path.stripSuffix("/all")

    lazy val hasParameters: Boolean = r.queryString.nonEmpty

    lazy val isHealthcheck: Boolean =
      r.headers.keys.exists(_ equalsIgnoreCase "X-Gu-Management-Healthcheck") || r.path == "/_healthcheck"

    lazy val rawQueryStringOption: Option[String] = if (r.rawQueryString.nonEmpty) Some(r.rawQueryString) else None

    //This is a header reliably set by jQuery for AJAX requests used in facia-tool
    lazy val isXmlHttpRequest: Boolean = r.headers.get("X-Requested-With").contains("XMLHttpRequest")

    lazy val isCrosswordFront: Boolean = r.path.endsWith("/crosswords")

    lazy val campaignCode: Option[String] = r.getQueryString("CMP")

    lazy val isAdFree: Boolean = r.headers.keys.exists(_ equalsIgnoreCase "X-Gu-Commercial-Ad-Free")

    lazy val referrer: Option[String] = r.headers.get("referer")

    // the X-GU-Territory header is used by the facia app to determine whether or not to render containers
    // targeted only at a specific region e.g. a new zealand-only container
    lazy val territories: List[TargetedTerritory] = r.headers
      .get(GUHeaders.TERRITORY_HEADER)
      .map { r =>
        territoryHeaders.filter(th => r.contains(th.headerString)).map(_.territory)
      }
      .getOrElse(List())

    // dotcom-rendering (DCR) parameters
    lazy val forceDCROff: Boolean = r.getQueryString("dcr").contains("false")
    // don't check for .contains(true) so people can be lazy
    lazy val forceDCR: Boolean = r.getQueryString("dcr").isDefined && !forceDCROff
    lazy val forceLiveOff: Boolean = r.getQueryString("live").contains("false")
    lazy val forceLive: Boolean = r.getQueryString("live").isDefined && !forceLiveOff

    // slot machine
    lazy val slotMachineFlags = r.getQueryString("slot-machine-flags").getOrElse("")

    lazy val renderHTMLOff =  r.getQueryString("html").contains("false")
    lazy val renderHTML =  r.getQueryString("html").isDefined && !renderHTMLOff
  }

}

object Requests extends Requests

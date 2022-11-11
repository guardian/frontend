package navigation

import io.lemonlabs.uri.Url
import io.lemonlabs.uri.config.UriConfig
import io.lemonlabs.uri.encoding.PercentEncoder
import navigation.ReaderRevenueSite._
import play.api.libs.json.Json
import play.api.mvc.RequestHeader

import scala.PartialFunction.condOpt
import common.Edition

object UrlHelpers {

  sealed trait Position
  case object Header extends Position
  // SlimHeaderDropdown can only be seen on slim header content, e.g. interactives
  // It's the icon with the three dots in the top left
  case object SlimHeaderDropdown extends Position
  // SideMenu is the full menu you get from clicking the hamburger icon on mobile
  case object SideMenu extends Position
  case object AmpHeader extends Position
  case object Footer extends Position
  case object AmpFooter extends Position
  case object ManageMyAccountUpsell extends Position
  case object ManageMyAccountCancel extends Position

  def getComponentId(destination: ReaderRevenueSite, position: Position): Option[String] = {
    condOpt((destination, position)) {
      case (Support, Header | SlimHeaderDropdown) => "header_support"
      case (Support, AmpHeader)                   => "amp_header_support"
      case (Support, SideMenu)                    => "side_menu_support"
      case (Support, Footer | AmpFooter)          => "footer_support"

      case (SupportContribute, Header | AmpHeader | SlimHeaderDropdown) => "header_support_contribute"
      case (SupportContribute, SideMenu)                                => "side_menu_support_contribute"
      case (SupportContribute, Footer)                                  => "footer_support_contribute"
      case (SupportContribute, AmpFooter)                               => "amp_footer_support_contribute"

      case (SupportSubscribe, Header | AmpHeader | SlimHeaderDropdown) => "header_support_subscribe"
      case (SupportSubscribe, SideMenu)                                => "side_menu_support_subscribe"
      case (SupportSubscribe, Footer)                                  => "footer_support_subscribe"
      case (SupportSubscribe, AmpFooter)                               => "amp_footer_support_subscribe"

      case (SupportGifting, Header | AmpHeader | SlimHeaderDropdown) => "header_support_gifting"
      case (SupportGifting, SideMenu)                                => "side_menu_support_gifting"
      case (SupportGifting, Footer)                                  => "footer_support_gifting"
      case (SupportGifting, AmpFooter)                               => "amp_footer_support_gifting"

      case (SupporterCTA, Header | AmpHeader | SlimHeaderDropdown) => "header_supporter_cta"
      case (SupporterCTA, SideMenu)                                => "side_menu_supporter_cta"
      case (SupporterCTA, Footer)                                  => "footer_supporter_cta"
      case (SupporterCTA, AmpFooter)                               => "amp_footer_supporter_cta"

      case (PrintCTA, Header)         => "header_print_cta"
      case (PrintCTAWeekly, Header)   => "header_print_cta"
      case (PrintCTA, SideMenu)       => "mobilenav_print_cta"
      case (PrintCTAWeekly, SideMenu) => "mobilenav_print_cta"

      case (_, ManageMyAccountUpsell) => "manage_my_account_upsell"
    }
  }

  def getComponentType(position: Position): String =
    position match {
      case Header | AmpHeader | SideMenu | SlimHeaderDropdown => "ACQUISITIONS_HEADER"
      case ManageMyAccountUpsell | ManageMyAccountCancel      => "ACQUISITIONS_MANAGE_MY_ACCOUNT"
      case Footer | AmpFooter                                 => "ACQUISITIONS_FOOTER"
    }

  def readerRevenueLinks(implicit request: RequestHeader): List[NavLink] =
    List(
      NavLink("Support us", getReaderRevenueUrl(SupportContribute, SideMenu)),
      NavLink(
        "Print subscriptions",
        if (Edition(request).id == "UK") getReaderRevenueUrl(SupporterCTA, SideMenu)
        else getReaderRevenueUrl(PrintCTAWeekly, SideMenu),
        classList = Seq("js-print-subscription"),
      ),
    )

  def getReaderRevenueUrl(destination: ReaderRevenueSite, position: Position): String = {
    val componentId = getComponentId(destination, position)
    val componentType = getComponentType(position)

    // Implicit - used when parsing url
    implicit val uriEncoder = UriConfig.default.copy(
      // The default encoder does not encode double quotes in the querystring
      queryEncoder = PercentEncoder(PercentEncoder.QUERY_CHARS_TO_ENCODE + '"'),
    )
    val acquisitionData = Json.obj(
      // GUARDIAN_WEB corresponds to a value in the Thrift enum
      // https://dashboard.ophan.co.uk/docs/thrift/acquisition.html#Enum_AcquisitionSource
      // ACQUISITIONS_HEADER and ACQUISITIONS_FOOTER correspond to values in the Thrift enum
      // https://dashboard.ophan.co.uk/docs/thrift/componentevent.html#Enum_ComponentType
      "source" -> "GUARDIAN_WEB",
      "componentType" -> componentType,
    ) ++ componentId.fold(Json.obj())(c =>
      Json.obj(
        "componentId" -> c,
      ),
    )

    import io.lemonlabs.uri.typesafe.dsl._

    // INTCMP is passed as a separate param because people look at it in Google Analytics
    // It's set to the most specific thing (componentId) to maximise its usefulness
    val url = destination.url ? ("INTCMP" -> componentId) & ("acquisitionData" -> acquisitionData.toString)
    Url.parse(url.toString).toString
  }

  def getJobUrl(editionId: String): String =
    if (editionId == "au") {
      "https://jobs.theguardian.com/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"
    } else {
      s"https://jobs.theguardian.com/?INTCMP=jobs_${editionId}_web_newheader"
    }
}

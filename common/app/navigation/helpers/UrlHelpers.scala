package navigation

import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import common.Edition
import navigation.ReaderRevenueSite._
import PartialFunction.condOpt

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
  case object ManageMyAccountUpsell extends Position
  case object ManageMyAccountCancel extends Position

  def getComponentId(destination: ReaderRevenueSite, position: Position)(implicit request: RequestHeader): Option[String] = {
    condOpt((destination, position)) {
      case (Support, Header | SlimHeaderDropdown) => "header_support"
      case (Support, AmpHeader) => "amp_header_support"
      case (Support, SideMenu) => "side_menu_support"
      case (Support, Footer) => "footer_support"

      case (SupportContribute, Header | AmpHeader | SlimHeaderDropdown) => "header_support_contribute"
      case (SupportContribute, SideMenu) => "side_menu_support_contribute"
      case (SupportContribute, Footer) => "footer_support_contribute"

      case (SupportSubscribe, Header | AmpHeader | SlimHeaderDropdown) => "header_support_subscribe"
      case (SupportSubscribe, SideMenu) => "side_menu_support_subscribe"
      case (SupportSubscribe, Footer) => "footer_support_subscribe"

      case (_, ManageMyAccountUpsell) => "manage_my_account_upsell"
    }
  }   

  def readerRevenueLinks(implicit request: RequestHeader): List[NavLink] = List(
    NavLink("Make a contribution", getReaderRevenueUrl(SupportContribute, SideMenu)),
    NavLink("Subscribe", getReaderRevenueUrl(SupportSubscribe, SideMenu), classList = Seq("js-subscribe"))
  )

  def getReaderRevenueUrl(destination: ReaderRevenueSite, position: Position)(implicit request: RequestHeader): String = {
    val componentId = getComponentId(destination, position)

    val acquisitionData = Json.obj(
      // GUARDIAN_WEB corresponds to a value in the Thrift enum
      // https://dashboard.ophan.co.uk/docs/thrift/acquisition.html#Enum_AcquisitionSource
      // ACQUISITIONS_HEADER and ACQUISITIONS_FOOTER correspond to values in the Thrift enum
      // https://dashboard.ophan.co.uk/docs/thrift/componentevent.html#Enum_ComponentType
      "source" -> "GUARDIAN_WEB",
      "componentType" -> (position match {
        case Header | AmpHeader | SideMenu | SlimHeaderDropdown => "ACQUISITIONS_HEADER"
        case ManageMyAccountUpsell | ManageMyAccountCancel => "ACQUISITIONS_MANAGE_MY_ACCOUNT"
        case Footer => "ACQUISITIONS_FOOTER"
      })
    ) ++ componentId.fold(Json.obj())(c => Json.obj(
      "componentId" -> c
    ))

    import com.netaporter.uri.dsl._

    // INTCMP is passed as a separate param because people look at it in Google Analytics
    // It's set to the most specific thing (componentId) to maximise its usefulness
    destination.url ? ("INTCMP" -> componentId) & ("acquisitionData" -> acquisitionData.toString)
  }

  def getJobUrl(editionId: String): String =
    if (editionId == "au") {
      "https://jobs.theguardian.com/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"
    } else {
      s"https://jobs.theguardian.com?INTCMP=jobs_${editionId}_web_newheader"
    }

  def getSoulmatesUrl: String = "https://soulmates.theguardian.com/?INTCMP=soulmates_uk_web_newheader"
}

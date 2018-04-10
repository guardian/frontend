package navigation

import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import common.Edition
import navigation.ReaderRevenueSite._

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

  def getCampaignCode(destination: ReaderRevenueSite, position: Position)(implicit request: RequestHeader): Option[String] = {
    val editionId = Edition(request).id.toUpperCase()

    (destination, position) match {
      case (Membership, Header | SideMenu) => Some(s"mem_${editionId.toLowerCase()}_web_newheader")
      case (Membership, AmpHeader) => Some("AMP_HEADER_GU_SUPPORTER")
      case (Membership, SlimHeaderDropdown) => Some(s"NGW_TOPNAV_${editionId}_GU_MEMBERSHIP")
      case (Membership, Footer) => Some(s"NGW_FOOTER_${editionId}_GU_MEMBERSHIP")

      case (Contribute, Header) => Some("gdnwb_copts_co_dotcom_header")
      case (Contribute, Footer) => Some("gdnwb_copts_memco_dotcom_footer")

      // this editionId is lowercase even though the rest of the campaign code is uppercase
      // this is for consistency with the existing campaign code
      case (Subscribe, SideMenu) => Some(s"NGW_NEWHEADER_${editionId.toLowerCase()}_GU_SUBSCRIBE")
      case (Subscribe, Header) => Some(s"subs_${editionId.toLowerCase()}_web_newheader")
      case (Subscribe, SlimHeaderDropdown) => Some(s"NGW_TOPNAV_${editionId}_GU_SUBSCRIBE")
      case (Subscribe, Footer) => Some(s"NGW_FOOTER_${editionId}_GU_SUBSCRIBE")

      case (Support, Footer) => Some("gdnwb_copts_memco_dotcom_footer")
      case (Support, AmpHeader) => Some("gdnwb_copts_memco_header_amp")
      case (Support, ManageMyAccountUpsell) => Some(s"DOTCOM_MANAGE_JOIN")
      case (Support, _) => Some("gdnwb_copts_memco_header")

      case (_, _) => None
    }
  }

  def getReaderRevenueUrl(destination: ReaderRevenueSite, position: Position)(implicit request: RequestHeader): String = {
    val campaignCode = getCampaignCode(destination, position)

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
    ) ++ campaignCode.fold(Json.obj())(c => Json.obj(
      // Currently campaignCode is used to uniquely identify components that drove acquisition.
      // This will eventually be the job of componentId, allowing us to re-purpose campaign code
      // for high-level groupings that correspond to actual campaigns (e.g. UK election).
      // But for now, we're duplicating this value across both fields.
      "componentId" -> c,
      "campaignCode" -> c
    ))

    import com.netaporter.uri.dsl._

    destination.url ? ("INTCMP" -> campaignCode) & ("acquisitionData" -> acquisitionData.toString)
  }

  def getJobUrl(editionId: String): String =
    if (editionId == "au") {
      "https://jobs.theguardian.com/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"
    } else {
      s"https://jobs.theguardian.com?INTCMP=jobs_${editionId}_web_newheader"
    }
}

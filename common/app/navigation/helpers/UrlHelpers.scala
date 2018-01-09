package navigation

import experiments._
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import common.Edition
import navigation.ReaderRevenueSite._

object UrlHelpers {

  sealed trait Position
  case object NewHeader extends Position
  case object OldHeader extends Position
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
    val isInHeaderTestControlGroup = ActiveExperiments.isControl(ABNewDesktopHeader)
    val editionId = Edition(request).id.toUpperCase()

    (destination, position, isInHeaderTestControlGroup) match {
      case (Membership, NewHeader | SideMenu, _) => Some(s"mem_${editionId.toLowerCase()}_web_newheader")
      case (Membership, OldHeader, true) => Some(s"mem_${editionId.toLowerCase()}_web_newheader_control")
      case (Membership, OldHeader, false) => Some(s"DOTCOM_HEADER_BECOMEMEMBER_${editionId}")
      case (Membership, AmpHeader, _) => Some("AMP_HEADER_GU_SUPPORTER")
      case (Membership, SlimHeaderDropdown, _) => Some(s"NGW_TOPNAV_${editionId}_GU_MEMBERSHIP")
      case (Membership, Footer, _) => Some(s"NGW_FOOTER_${editionId}_GU_MEMBERSHIP")

      case (Contribute, NewHeader | OldHeader, _) => Some("gdnwb_copts_co_dotcom_header")
      case (Contribute, Footer, _) => Some("gdnwb_copts_memco_dotcom_footer")

      // this editionId is lowercase even though the rest of the campaign code is uppercase
      // this is for consistency with the existing campaign code
      case (Subscribe, SideMenu, _) => Some(s"NGW_NEWHEADER_${editionId.toLowerCase()}_GU_SUBSCRIBE")
      case (Subscribe, NewHeader, _) => Some(s"subs_${editionId.toLowerCase()}_web_newheader")
      case (Subscribe, OldHeader, true) => Some(s"subs_${editionId}_web_newheader_control")
      case (Subscribe, OldHeader, false) => Some(s"NGW_HEADER_${editionId}_GU_SUBSCRIBE")
      case (Subscribe, SlimHeaderDropdown, _) => Some(s"NGW_TOPNAV_${editionId}_GU_SUBSCRIBE")
      case (Subscribe, Footer, _) => Some(s"NGW_FOOTER_${editionId}_GU_SUBSCRIBE")

      case (Support, Footer, _) => Some("gdnwb_copts_memco_dotcom_footer")
      case (Support, AmpHeader, _) => Some("gdnwb_copts_memco_header_amp")
      case (Support, ManageMyAccountUpsell, _) => Some(s"DOTCOM_MANAGE_JOIN")
      case (Support, _, _) => Some("gdnwb_copts_memco_header")

      case (_, _, _) => None
    }
  }

  case class ABTest(name: String, variant: String)

  def getHeaderABTestInfo(implicit request: RequestHeader): Option[ABTest] =
    if (ActiveExperiments.isControl(ABNewDesktopHeader)) {
      Some(ABTest("NewDesktopHeader", "control"))
    } else if (experiments.ActiveExperiments.isParticipating(experiments.ABNewDesktopHeader)) {
      Some(ABTest("NewDesktopHeader", "variant"))
    } else {
      None
    }

  def getReaderRevenueUrl(destination: ReaderRevenueSite, position: Position)(implicit request: RequestHeader): String = {
    val campaignCode = getCampaignCode(destination, position)
    val abTest = position match {
      case NewHeader | OldHeader => getHeaderABTestInfo
      case _ => None
    }

    val acquisitionData = Json.obj(
      // GUARDIAN_WEB corresponds to a value in the Thrift enum
      // https://dashboard.ophan.co.uk/docs/thrift/acquisition.html#Enum_AcquisitionSource
      // ACQUISITIONS_HEADER and ACQUISITIONS_FOOTER correspond to values in the Thrift enum
      // https://dashboard.ophan.co.uk/docs/thrift/componentevent.html#Enum_ComponentType
      "source" -> "GUARDIAN_WEB",
      "componentType" -> (position match {
        case NewHeader | OldHeader | AmpHeader | SideMenu | SlimHeaderDropdown => "ACQUISITIONS_HEADER"
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
    )) ++ abTest.fold(Json.obj())(ab => Json.obj(
      "abTest" -> Json.obj(
        "name" -> ab.name,
        "variant" -> ab.variant
      )
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

  def countryUrlLogic(editionId: String, position: Position, defaultDestination: ReaderRevenueSite)(implicit request: RequestHeader): String =
    editionId match {
      case "us" => getReaderRevenueUrl(SupportUsContribute, position)
      case "uk" => getReaderRevenueUrl(Support, position)
      case _ => getReaderRevenueUrl(defaultDestination, position)
    }

  def getContributionOrSupporterUrl(editionId: String)(implicit request: RequestHeader): String =
    countryUrlLogic(editionId, NewHeader, Membership)

  // This methods can be reverted once we decide to deploy the new support site to the rest of the world.
  def getSupportOrMembershipUrl(position: Position)(implicit request: RequestHeader): String = {
    val editionId = Edition(request).id.toLowerCase()
    countryUrlLogic(editionId, position, Membership)
  }

  def getSupportOrContributeUrl(position: Position)(implicit request: RequestHeader): String = {
    val editionId = Edition(request).id.toLowerCase()
    countryUrlLogic(editionId, position, Contribute)
  }

  def getSupportOrSubscriptionUrl(position: Position)(implicit request: RequestHeader): String = {
    val editionId = Edition(request).id.toLowerCase()
    if (editionId == "uk") {
      getReaderRevenueUrl(Support, position)
    } else {
      getReaderRevenueUrl(Subscribe, position)
    }
  }

  object oldNav {
    def jobsUrl(edition: String)(implicit request: RequestHeader): String =
      if(ActiveExperiments.isControl(ABNewDesktopHeader)) {
        s"https://jobs.theguardian.com/?INTCMP=jobs_${edition}_web_newheader_control"
      } else {
        s"https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_${edition.toUpperCase}_GU_JOBS"
      }

    def soulmatesUrl(edition: String)(implicit request: RequestHeader): String =
      if(ActiveExperiments.isControl(ABNewDesktopHeader)) {
        s"https://soulmates.theguardian.com/?INTCMP=soulmates_${edition}_web_newheader_control"
      } else {
        s"https://soulmates.theguardian.com/?INTCMP=NGW_TOPNAV_${edition.toUpperCase}_GU_SOULMATES"
      }

    def holidaysUrl(implicit request: RequestHeader): String =
      if(ActiveExperiments.isControl(ABNewDesktopHeader)) {
        "https://holidays.theguardian.com/?INTCMP=holidays_uk_web_newheader_control"
      } else {
        "https://holidays.theguardian.com/?utm_source=theguardian&utm_medium=guardian-links&utm_campaign=topnav&INTCMP=topnav"
      }

    def masterclassesUrl(implicit request: RequestHeader): String =
      if(ActiveExperiments.isControl(ABNewDesktopHeader)) {
        "https://membership.theguardian.com/masterclasses?INTCMP=masterclasses_uk_web_newheader_control"
      } else {
        "https://membership.theguardian.com/masterclasses?INTCMP=NGW_TOPNAV_UK_GU_MASTERCLASSES"
      }

  }

}

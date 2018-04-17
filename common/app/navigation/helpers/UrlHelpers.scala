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
      case (Membership, Header | AmpHeader | SlimHeaderDropdown) => "header_membership"
      case (Membership, SideMenu) => "side_menu_membership"
      case (Membership, Footer) => "footer_membership"

      case (Contribute, Header | AmpHeader | SlimHeaderDropdown) => "header_contribute"
      case (Contribute, SideMenu) => "side_menu_membership"
      case (Contribute, Footer) => "footer_contribute"

      case (Subscribe, Header | AmpHeader | SlimHeaderDropdown) => "header_subscribe"
      case (Subscribe, SideMenu) => "side_menu_subscribe"
      case (Subscribe, Footer) => "footer_subscribe"

      case (Support, Header | AmpHeader | SlimHeaderDropdown) => "header_support"
      case (Support, SideMenu) => "side_menu_support"
      case (Support, Footer) => "footer_support"

      case (SupportUkSubscribe, Header | AmpHeader | SlimHeaderDropdown) => "header_support_uk_subscribe"
      case (SupportUkSubscribe, SideMenu) => "side_menu_support_uk_subscribe"
      case (SupportUkSubscribe, Footer) => "footer_support_uk_subscribe"

      case (_, ManageMyAccountUpsell) => "manage_my_account_upsell"
    }
  }

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

  def countryUrlLogic(editionId: String, position: Position, defaultDestination: ReaderRevenueSite)(implicit request: RequestHeader): String =
    editionId match {
      case "us" => getReaderRevenueUrl(SupportUsContribute, position)
      case "uk" => getReaderRevenueUrl(Support, position)
      case _ => getReaderRevenueUrl(defaultDestination, position)
    }

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
      getReaderRevenueUrl(SupportUkSubscribe, position)
    } else {
      getReaderRevenueUrl(Subscribe, position)
    }
  }
}

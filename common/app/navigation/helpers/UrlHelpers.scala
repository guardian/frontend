package navigation

import conf.Configuration
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import common.Edition

object UrlHelpers {
  sealed trait ReaderRevenueSite {
    val url: String
  }
  case object Membership extends ReaderRevenueSite {
    val url: String = s"${Configuration.id.membershipUrl}/supporter"
  }
  case object Contribute extends ReaderRevenueSite {
    val url: String = Configuration.id.contributeUrl
  }
  case object Subscribe extends ReaderRevenueSite {
    val url: String = Configuration.id.subscribeUrl
  }

  sealed trait Position
  case object NewHeader extends Position
  case object OldHeader extends Position
  case object SideMenu extends Position
  case object AmpHeader extends Position
  case object Footer extends Position

  def getCampaignCode(implicit request: RequestHeader, destination: ReaderRevenueSite, position: Position): String = {
    val isInHeaderTestControlGroup = mvt.ABNewDesktopHeaderControl.isParticipating
    val editionId = Edition(request).id

    (destination, position, isInHeaderTestControlGroup) match {
      case (Membership, NewHeader | SideMenu, _) => s"mem_${editionId.toLowerCase}_web_newheader"
      case (Membership, OldHeader, true) => s"mem_${editionId.toLowerCase}_web_newheader_control"
      case (Membership, OldHeader, false) => s"DOTCOM_HEADER_BECOMEMEMBER_${editionId.toUpperCase}"
      case (Membership, AmpHeader, _) => "AMP_HEADER_GU_SUPPORTER"

      // TODO: double-check new & old header are the same for this one?
      case (Contribute, NewHeader | OldHeader, _) => "gdnwb_copts_co_dotcom_header"
      case (Contribute, Footer, _) => "gdnwb_copts_memco_dotcom_footer"

      case (Subscribe, SideMenu, _) => s"NGW_NEWHEADER_${editionId}_GU_SUBSCRIBE"
      case (Subscribe, NewHeader, _) => s"subs_${editionId}_web_newheader"
      case (Subscribe, OldHeader, true) => s"subs_${editionId}_web_newheader_control"
      case (Subscribe, OldHeader, false) => s"NGW_HEADER_${editionId}_GU_SUBSCRIBE"

      case (_, _, _) => ""
    }
  }

  case class ABTest(name: String, variant: String)

  def getHeaderABTestInfo(implicit request: RequestHeader): Option[ABTest] =
    if (mvt.ABNewDesktopHeaderControl.isParticipating) {
      Some(ABTest("NewDesktopHeader", "control"))
    } else if (mvt.ABNewDesktopHeaderVariant.isParticipating) {
      Some(ABTest("NewDesktopHeader", "variant"))
    } else {
      None
    }

  def getReaderRevenueUrl(destination: ReaderRevenueSite, position: Position)(implicit request: RequestHeader): String = {
    val campaignCode = getCampaignCode(request, destination, position)
    val abTest = position match {
      case NewHeader | OldHeader => getHeaderABTestInfo
      case _ => None
    }

    val acquisitionData = Json.obj(
      // TODO: lock this down by importing the Thrift type?
      "source" -> "GUARDIAN_WEB",
      "componentId" -> campaignCode,
      "componentType" -> (position match {
        case NewHeader | OldHeader | AmpHeader | SideMenu => "ACQUISITIONS_HEADER"
        case Footer => "ACQUISITIONS_FOOTER"
      }),
      // TODO: there's no way to get this serverside is there? replace clientside??
      "referrerPageviewId" -> "",
      "campaignCode" -> campaignCode
    ) ++ abTest.fold(Json.obj())(ab => Json.obj(
      "name" -> ab.name,
      "variant" -> ab.variant
    ))

    // TODO: I've ditched the linking direct to edition country. Double-check this is OK.
    s"${destination.url}?INCTMP=$campaignCode&acquisitionData=${acquisitionData.toString}"
  }

  def getJobUrl(editionId: String): String =
    if (editionId == "au") {
      "https://jobs.theguardian.com/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"
    } else {
      s"https://jobs.theguardian.com?INTCMP=jobs_${editionId}_web_newheader"
    }

  def getContributionOrSupporterUrl(editionId: String)(implicit request: RequestHeader): String =
    if (editionId == "us") {
      getReaderRevenueUrl(Contribute, NewHeader)
    } else {
      getReaderRevenueUrl(Membership, NewHeader)
    }

  object oldNav {
    def jobsUrl(edition: String)(implicit request: RequestHeader): String =
      if(mvt.ABNewDesktopHeaderControl.isParticipating) {
        s"https://jobs.theguardian.com/?INTCMP=jobs_${edition}_web_newheader_control"
      } else {
        s"https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_${edition.toUpperCase}_GU_JOBS"
      }

    def soulmatesUrl(edition: String)(implicit request: RequestHeader): String =
      if(mvt.ABNewDesktopHeaderControl.isParticipating) {
        s"https://soulmates.theguardian.com/?INTCMP=soulmates_${edition}_web_newheader_control"
      } else {
        s"https://soulmates.theguardian.com/?INTCMP=NGW_TOPNAV_${edition.toUpperCase}_GU_SOULMATES"
      }

    def holidaysUrl(implicit request: RequestHeader): String =
      if(mvt.ABNewDesktopHeaderControl.isParticipating) {
        "https://holidays.theguardian.com/?INTCMP=holidays_uk_web_newheader_control"
      } else {
        "https://holidays.theguardian.com/?utm_source=theguardian&utm_medium=guardian-links&utm_campaign=topnav&INTCMP=topnav"
      }

    def masterclassesUrl(implicit request: RequestHeader): String =
      if(mvt.ABNewDesktopHeaderControl.isParticipating) {
        "https://www.theguardian.com/guardian-masterclasses?INTCMP=masterclasses_uk_web_newheader_control"
      } else {
        "https://www.theguardian.com/guardian-masterclasses?INTCMP=NGW_TOPNAV_UK_GU_MASTERCLASSES"
      }

  }

}

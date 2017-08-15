package navigation

import conf.Configuration.id.membershipUrl
import play.api.mvc.RequestHeader

object UrlHelpers {

  def getJobUrl(editionId: String): String =
    if (editionId == "au") {
      "https://jobs.theguardian.com/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"
    } else {
      s"https://jobs.theguardian.com?INTCMP=jobs_${editionId}_web_newheader"
    }

  def getContributionOrSupporterUrl(editionId: String): String =
    if(editionId == "us") {
      "https://contribute.theguardian.com/us?INTCMP=gdnwb_copts_co_dotcom_header"
    } else {
      s"${membershipUrl}/${editionId}/supporter?INTCMP=mem_${editionId}_web_newheader"
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

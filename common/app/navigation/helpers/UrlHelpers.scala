package navigation

import conf.Configuration.id.membershipUrl

object UrlHelpers {

  def getJobUrl(editionId: String): String = {
    if (editionId == "au") {
      "https://jobs.theguardian.com/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"
    } else {
      s"https://jobs.theguardian.com?INTCMP=jobs_${editionId}_web_newheader"
    }
  }

  def getContributionOrSupporterUrl(editionId: String): String = {
    if(editionId == "us") {
      "https://contribute.theguardian.com/us?INTCMP=gdnwb_copts_co_dotcom_header"
    } else {
      s"${membershipUrl}/${editionId}/supporter?INTCMP=mem_${editionId}_web_newheader"
    }
  }
}

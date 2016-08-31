package staticpages

import model.{GuardianContentTypes, SectionSummary, MetaData, SimplePage}

object StaticPages {
  def simpleSurveyStaticPageForId(id: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Guardian Survey Page",
      analyticsName = "global",
      contentType = "survey",
      iosType = None,
      shouldGoogleIndex = false))

  def subscriberNumberPage: SimplePage = SimplePage(
    MetaData.make(
      id = "subscriber-number-page",
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Subscriber number form",
      analyticsName = "subscriber-number-page",
      contentType = GuardianContentTypes.NetworkFront,
      iosType = None,
      shouldGoogleIndex = false))
}

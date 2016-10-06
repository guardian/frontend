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

  def contributorEmailPage: SimplePage = SimplePage(
    MetaData.make(
      id = "contributor-email-page",
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Contributor email submission form",
      analyticsName = "contributor-email-page",
      contentType = GuardianContentTypes.NetworkFront,
      iosType = None,
      shouldGoogleIndex = false))

  def contributorEmailSubmitted: SimplePage = SimplePage(
    MetaData.make(
      id = "contributor-email-page-submitted",
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Contributor email submission result",
      analyticsName = "contributor-email-submitted",
      contentType = GuardianContentTypes.NetworkFront,
      iosType = None,
      shouldGoogleIndex = false))

  def simpleEmailSignupPage(id: String, webTitle: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="email-signup-page", activeBrandings=None)),
      webTitle = webTitle,
      analyticsName = "global",
      // a currently running AB test is using `contentType = "survey"` change this to "signup" after 2016-09-13
      contentType = "survey",
      iosType = None,
      shouldGoogleIndex = false))
}

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

  def simpleEmailSignupPage(id: String, webTitle: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="email-signup-page", activeBrandings=None)),
      webTitle = webTitle,
      analyticsName = "email-signup-page",
      contentType = "signup",
      iosType = None,
      shouldGoogleIndex = false))

  def simpleNewslettersPage(id: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Sign up for Guardian emails",
      analyticsName = "newsletter-signup-page",
      contentType = "signup",
      iosType = None,
      shouldGoogleIndex = false))
}

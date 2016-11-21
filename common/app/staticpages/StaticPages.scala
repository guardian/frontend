package staticpages

import model.{SectionSummary, MetaData, SimplePage}

object StaticPages {
  def simpleSurveyStaticPageForId(id: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Guardian Survey Page",
      contentType = "survey",
      iosType = None,
      shouldGoogleIndex = false))

  def simpleEmailSignupPage(id: String, webTitle: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="email-signup-page", activeBrandings=None)),
      webTitle = webTitle,
      contentType = "Signup",
      iosType = None,
      shouldGoogleIndex = false))
}

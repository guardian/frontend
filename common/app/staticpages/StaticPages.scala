package staticpages

import model.{SectionSummary, MetaData, SimplePage}

object StaticPages {
  def simpleSurveyStaticPageForId(id: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="global")),
      webTitle = "Guardian Survey Page",
      contentType = "survey",
      iosType = None,
      shouldGoogleIndex = false))

  def simpleEmailSignupPage(id: String, webTitle: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="email-signup-page")),
      webTitle = webTitle,
      contentType = "Signup",
      iosType = None,
      shouldGoogleIndex = false))

  def simpleNewslettersPage(id: String): SimplePage = SimplePage(
    MetaData.make(
      id = id,
      section = Option(SectionSummary(id="newsletter-signup-page")),
      webTitle = "Sign up for Guardian emails",
      contentType = "Signup",
      iosType = None,
      shouldGoogleIndex = false))
}

package staticpages

import model.{SectionSummary, MetaData, SimplePage}

object StaticPages {
  val simpleSurveyStaticPage: SimplePage = SimplePage(
    MetaData.make(
      id = "simple-survey-page",
      section = Option(SectionSummary(id="global", activeBrandings=None)),
      webTitle = "Simple Survey Page",
      analyticsName = "global",
      contentType = "survey",
      iosType = None))
}

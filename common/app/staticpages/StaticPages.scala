package staticpages

import model.{MetaData, SimplePage}

object StaticPages {
  val simpleSurveyStaticPage: SimplePage = SimplePage(
    MetaData.make(
      id = "simple-survey-page",
      section = "global",
      webTitle = "Simple Survey Page",
      analyticsName = "global"))
}

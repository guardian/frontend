package views.commercial.support

import common.StaticPage
import model.MetaData

object StaticPages {

  val adFreeSurvey: MetaData = new StaticPage {
    def id: String = "ad-free-survey"
    def webTitle: String = "Ad-free Survey"
  }
}

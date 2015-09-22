package views.support

import model.MetaData

object StaticPages {

  val adFreeSurvey: MetaData = new MetaData {
    lazy val id: String = "ad-free-survey-page"
    lazy val section: String = ""
    lazy val analyticsName: String = id
    lazy val webTitle: String = "Adfree Survey"
    override def hasSlimHeader: Boolean = true
  }

  val adFreeSurveySimple: MetaData = new MetaData {
    lazy val id: String = "ad-free-survey-simple-page"
    lazy val section: String = ""
    lazy val analyticsName: String = id
    lazy val webTitle: String = "Adfree Survey simple"
    override def hasSlimHeader: Boolean = true
  }
}

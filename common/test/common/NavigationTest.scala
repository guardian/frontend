package common

import common.editions._
import model.{MetaData, SectionSummary, SimplePage}
import org.scalatest.{FlatSpec, Matchers, OptionValues}

class NavigationTest extends FlatSpec with Matchers with OptionValues {
  "topLevelItem" should "return culture for games" in {
    Navigation.topLevelItem(Uk.briefNav, SimplePage(MetaData.make(
      id = "technology/games",
      section = Some(SectionSummary.fromId("technology")),
      analyticsName = "",
      webTitle= "")
    )).value.name.title shouldEqual "culture"
  }
  "UK brief nav 'world'" should "contain 'cities'" in {
    Uk.briefNav.filter(_.name.title == "world").flatMap {
      _.links.filter(_.title == "cities")
    }.isEmpty shouldEqual false
  }
  "US brief nav 'world'" should "contain 'cities'" in {
    Us.briefNav.filter(_.name.title == "world").flatMap {
      _.links.filter(_.title == "cities")
    }.isEmpty shouldEqual false
  }
  "AU brief nav 'world'" should "not contain 'cities'" in {
    Au.briefNav.filter(_.name.title == "world").flatMap {
      _.links.filter(_.title == "cities")
    }.isEmpty shouldEqual true
  }
  "UK full nav" should "contain 'membership'" in {
    Uk.navigation.filter(_.name.title == "membership").isEmpty shouldEqual false
  }
  "US full nav" should "not contain 'membership'" in {
    Us.navigation.filter(_.name.title == "membership").isEmpty shouldEqual true
  }
  "AU full nav" should "contain 'membership'" in {
    Au.navigation.filter(_.name.title == "membership").isEmpty shouldEqual false
  }
  "UK full nav" should "not contain 'education' or 'media'" in {
    Uk.navigation.filter(n => n.name.title == "education" || n.name.title == "media").isEmpty shouldEqual true
  }
}

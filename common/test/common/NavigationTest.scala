package common

import common.editions.Uk
import model.MetaData
import org.scalatest.{OptionValues, Matchers, FlatSpec}

class NavigationTest extends FlatSpec with Matchers with OptionValues {
  "topLevelItem" should "return culture for games" in {
    Navigation.topLevelItem(Uk.briefNav, new MetaData {
      override def id: String = "technology/games"

      override def section: String = "technology"

      override def analyticsName: String = ???

      override def webTitle: String = ???
    }).value.name.title shouldEqual "culture"
  }
}

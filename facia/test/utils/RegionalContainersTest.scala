package utils

import com.gu.facia.client.models.NZTerritory
import helpers.FaciaTestData
import org.scalatest.FlatSpec
import org.scalatest.Matchers._

class RegionalContainersTest extends FlatSpec with FaciaTestData {

  behavior of "FrontUtilsTest"

  it should "filterCollections" in {
    val pressedPage = internationalFaciaPageWithTargetedTerritories
    val filteredPage = RegionalContainers.filterCollections(pressedPage, List(NZTerritory))
    filteredPage.collections.length should be (2)
    filteredPage.collections.map(c => c.id) should contain inOrderOnly ("international/nz", "international/normal")
    filteredPage.collections.map(c => c.id) should not contain ("international/eu")
  }

  it should "correctly mark collections" in {
    val pressedPage = internationalFaciaPageWithTargetedTerritories
    val filteredPage = RegionalContainers.markCollections(pressedPage)
    filteredPage.collections.length should be (3)
    filteredPage.collections.map(_.displayName) should contain inOrderOnly ("One (New Zealand ONLY)", "Two (EU-27 Countries ONLY)", "Three")
  }

}

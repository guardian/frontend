package utils

import common.facia.{FixtureBuilder, PressedCollectionBuilder}
import model.PressedPage
import model.facia.PressedCollection
import experiments.{ExperimentsDefinition, FrontRendering}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import org.mockito.Mockito.when
import test.TestRequest

@DoNotDiscover class FaciaPickerTest extends AnyFlatSpec with Matchers {

  "Facia Picker dcrSupportsAllCollectionTypes" should "return false if at least one collection type of the faciaPage collections is not supported" in {
    val unsupportedPressedCollection =
      List(
        PressedCollectionBuilder.mkPressedCollection(collectionType = FaciaPicker.SUPPORTED_COLLECTIONS.head),
        PressedCollectionBuilder.mkPressedCollection(collectionType = "non-supported-collection-type"),
      )

    val faciaPage = FixtureBuilder.mkPressedPage(unsupportedPressedCollection)
    FaciaPicker.dcrSupportsAllCollectionTypes(faciaPage) should be(false)
  }

  it should "return true if all collection types of a facia page are supported" in {
    val supportedTypes = FaciaPicker.SUPPORTED_COLLECTIONS.take(3).toList
    val supportedPressedCollection =
      List(
        PressedCollectionBuilder.mkPressedCollection(collectionType = supportedTypes(0)),
        PressedCollectionBuilder.mkPressedCollection(collectionType = supportedTypes(1)),
        PressedCollectionBuilder.mkPressedCollection(collectionType = supportedTypes(2)),
      )

    val faciaPage = FixtureBuilder.mkPressedPage(supportedPressedCollection)
    FaciaPicker.dcrSupportsAllCollectionTypes(faciaPage) should be(true)
  }

  "Facia Picker decideTier" should "return LocalRender if dcr=false" in {
    val forceDCROff = true
    val forceDCR = false
    val participatingInTest = true
    val dcrCouldRender = true

    val tier = FaciaPicker.decideTier(forceDCROff, forceDCR, participatingInTest, dcrCouldRender)
    tier should be(LocalRender)
  }

  it should "return RemoteRender if dcr=true" in {
    val forceDCROff = false
    val forceDCR = true
    val participatingInTest = false
    val dcrCouldRender = false

    val tier = FaciaPicker.decideTier(forceDCROff, forceDCR, participatingInTest, dcrCouldRender)
    tier should be(RemoteRender)
  }

  it should "return LocalRender if no flag is provided, participatingInTest is false and dcrCouldRender is true" in {
    val forceDCROff = false
    val forceDCR = false
    val participatingInTest = false
    val dcrCouldRender = true

    val tier = FaciaPicker.decideTier(forceDCROff, forceDCR, participatingInTest, dcrCouldRender)
    tier should be(LocalRender)
  }

  it should "return RemoteRender if no flag is provided and participatingInTest and dcrCouldRender are true" in {
    val forceDCROff = false
    val forceDCR = false
    val participatingInTest = true
    val dcrCouldRender = true

    val tier = FaciaPicker.decideTier(forceDCROff, forceDCR, participatingInTest, dcrCouldRender)
    tier should be(RemoteRender)
  }
}

package services.dotcomrendering

import common.facia.{FixtureBuilder, PressedCollectionBuilder}
import com.gu.facia.client.models.AUQueenslandTerritory
import model.pressed.LinkSnap
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

@DoNotDiscover class FaciaPickerTest extends AnyFlatSpec with Matchers with MockitoSugar {

  "Facia Picker allCollectionsAreSupported" should "return false if at least one collection type of the faciaPage collections is not supported" in {
    val unsupportedPressedCollection =
      List(
        PressedCollectionBuilder.mkPressedCollection(collectionType = FrontChecks.SUPPORTED_COLLECTIONS.head),
        PressedCollectionBuilder.mkPressedCollection(collectionType = "non-supported-collection-type"),
      )

    val faciaPage = FixtureBuilder.mkPressedPage(unsupportedPressedCollection)
    FrontChecks.allCollectionsAreSupported(faciaPage) should be(false)
  }

  it should "return true if all collection types of a facia page are supported" in {
    val supportedTypes = FrontChecks.SUPPORTED_COLLECTIONS.take(3).toList
    val supportedPressedCollection =
      List(
        PressedCollectionBuilder.mkPressedCollection(collectionType = supportedTypes(0)),
        PressedCollectionBuilder.mkPressedCollection(collectionType = supportedTypes(1)),
        PressedCollectionBuilder.mkPressedCollection(collectionType = supportedTypes(2)),
      )

    val faciaPage = FixtureBuilder.mkPressedPage(supportedPressedCollection)
    FrontChecks.allCollectionsAreSupported(faciaPage) should be(true)
  }

  "Facia Picker decideTier" should "return LocalRender if dcr=false" in {
    val isRSS = false
    val forceDCROff = true
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = false
    val isInNetworkFrontTest = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(LocalRender)
  }

  it should "return RemoteRender if dcr=true" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = true
    val dcrSwitchEnabled = false
    val dcrCouldRender = false
    val isNetworkFront = false
    val isInNetworkFrontTest = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(RemoteRender)
  }

  it should "return LocalRender if no flag is provided, dcrSwitchEnabled is false and dcrCouldRender is true" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = false
    val dcrCouldRender = true
    val isNetworkFront = false
    val isInNetworkFrontTest = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(LocalRender)
  }

  it should "return RemoteRender if no flag is provided and dcrSwitchEnabled and dcrCouldRender are true" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = false
    val isInNetworkFrontTest = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(RemoteRender)
  }

  it should "return LocalRender if the request is for RSS" in {
    val isRSS = true
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = false
    val isInNetworkFrontTest = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(LocalRender)
  }

  it should "return LocalRender if a Network front is not in the test" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = true
    val isInNetworkFrontTest = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(LocalRender)
  }

  it should "return RemoteRender if a Network front is in the test" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = true
    val isInNetworkFrontTest = true

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      isInNetworkFrontTest,
    )
    tier should be(RemoteRender)
  }

  val linkSnap = FixtureBuilder.mkPressedLinkSnap(1).asInstanceOf[LinkSnap]
  val supportedThrasher = PressedCollectionBuilder.mkPressedCollection(curated =
    List(
      linkSnap.copy(properties =
        linkSnap.properties
          .copy(embedType = Some("interactive"), embedUri = Some("supported-thrasher-embedUri")),
      ),
    ),
  )

  "Facia Picker hasNoUnsupportedSnapLinkCards" should "return false if a front contains at least one unsupported thrasher" in {
    val unsupportedThrasher = PressedCollectionBuilder.mkPressedCollection(curated =
      List(
        linkSnap.copy(properties =
          linkSnap.properties
            .copy(embedType = Some("interactive"), embedUri = Some(FrontChecks.UNSUPPORTED_THRASHERS.take(1).head)),
        ),
      ),
    )

    val faciaPage = FixtureBuilder.mkPressedPage(
      List(
        PressedCollectionBuilder
          .mkPressedCollection(collectionType = FrontChecks.SUPPORTED_COLLECTIONS.take(1).toList.head),
        unsupportedThrasher,
        supportedThrasher,
      ),
    )

    FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage) should be(false)
  }

  it should "return true if all thrashers in a front are supported" in {
    val faciaPage = FixtureBuilder.mkPressedPage(
      List(
        PressedCollectionBuilder
          .mkPressedCollection(collectionType = FrontChecks.SUPPORTED_COLLECTIONS.take(1).toList.head),
        supportedThrasher,
        supportedThrasher,
      ),
    )

    FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage) should be(true)
  }
}

package services.dotcomrendering

import common.facia.{FixtureBuilder, PressedCollectionBuilder}
import com.gu.facia.client.models.AUQueenslandTerritory
import model.pressed.LinkSnap
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import helpers.FaciaTestData
import test.FaciaControllerTest
import model.facia.PressedCollection
import layout.slices.EmailLayouts

@DoNotDiscover class FaciaPickerTest extends AnyFlatSpec with FaciaTestData with Matchers with MockitoSugar {

  "Facia Picker decideTier" should "return LocalRender if dcr=false" in {
    val isRSS = false
    val forceDCROff = true
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = false
    val dcrNetworkFrontsSwitchEnabled = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
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
    val dcrNetworkFrontsSwitchEnabled = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
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
    val dcrNetworkFrontsSwitchEnabled = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
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
    val dcrNetworkFrontsSwitchEnabled = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
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
    val dcrNetworkFrontsSwitchEnabled = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
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
    val dcrNetworkFrontsSwitchEnabled = false

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
    )
    tier should be(LocalRender)
  }

  it should "return RemoteRender if a Network front and dcr network fronts switch is on" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = true
    val dcrCouldRender = true
    val isNetworkFront = true
    val dcrNetworkFrontsSwitchEnabled = true

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
    )
    tier should be(RemoteRender)
  }

  it should "return LocalRender for a Network front if the dcr fronts switch is off even if in dcr network fronts switch is on" in {
    val isRSS = false
    val forceDCROff = false
    val forceDCR = false
    val dcrSwitchEnabled = false
    val dcrCouldRender = true
    val isNetworkFront = true
    val dcrNetworkFrontsSwitchEnabled = true

    val tier = FaciaPicker.decideTier(
      isRSS,
      forceDCROff,
      forceDCR,
      dcrSwitchEnabled,
      dcrCouldRender,
      isNetworkFront,
      dcrNetworkFrontsSwitchEnabled,
    )
    tier should be(LocalRender)
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
        unsupportedThrasher,
        supportedThrasher,
      ),
    )

    FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage) should be(false)
  }

  it should "return true if all thrashers in a front are supported" in {
    val faciaPage = FixtureBuilder.mkPressedPage(
      List(
        supportedThrasher,
        supportedThrasher,
      ),
    )

    FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage) should be(true)
  }

  it should "Should render supported collections" in {
    val faciaPage = FixtureBuilder.mkPressedPage(
      List(
        PressedCollectionBuilder.mkPressedCollection("dynamic/fast"),
        PressedCollectionBuilder.mkPressedCollection("dynamic/package"),
        PressedCollectionBuilder.mkPressedCollection("dynamic/slow"),
        PressedCollectionBuilder.mkPressedCollection("dynamic/slow-mpu"),
        PressedCollectionBuilder.mkPressedCollection("fixed/large/slow-XIV"),
        PressedCollectionBuilder.mkPressedCollection("fixed/medium/fast-XI"),
        PressedCollectionBuilder.mkPressedCollection("fixed/medium/fast-XII"),
        PressedCollectionBuilder.mkPressedCollection("fixed/medium/slow-VI"),
        PressedCollectionBuilder.mkPressedCollection("fixed/medium/slow-VII"),
        PressedCollectionBuilder.mkPressedCollection("fixed/medium/slow-XII-mpu"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/fast-VIII"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/slow-I"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/slow-III"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/slow-IV"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/slow-V-half"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/slow-V-mpu"),
        PressedCollectionBuilder.mkPressedCollection("fixed/small/slow-V-third"),
        PressedCollectionBuilder.mkPressedCollection("fixed/thrasher"),
        PressedCollectionBuilder.mkPressedCollection("nav/list"),
        PressedCollectionBuilder.mkPressedCollection("nav/media-list"),
        PressedCollectionBuilder.mkPressedCollection("news/most-popular"),
        PressedCollectionBuilder.mkPressedCollection("scrollable/highlights"),
        PressedCollectionBuilder.mkPressedCollection("flexible/special"),
        PressedCollectionBuilder.mkPressedCollection("flexible/general"),
        PressedCollectionBuilder.mkPressedCollection("scrollable/small"),
        PressedCollectionBuilder.mkPressedCollection("scrollable/medium"),
        PressedCollectionBuilder.mkPressedCollection("scrollable/feature"),
        PressedCollectionBuilder.mkPressedCollection("static/feature/2"),
        PressedCollectionBuilder.mkPressedCollection("static/medium/4"),
      ),
    )

    FrontChecks.hasOnlySupportedCollections(faciaPage) should be(true)
  }

  it should "Should not render Email layouts" in {
    val supported = EmailLayouts.all.keySet.exists(collectionType => {
      val faciaPage = FixtureBuilder.mkPressedPage(
        List(PressedCollectionBuilder.mkPressedCollection(collectionType)),
      )
      FrontChecks.hasOnlySupportedCollections(faciaPage)
    })

    supported should be(false)
  }

  it should "Should not render Showcase" in {
    val faciaPage = FixtureBuilder.mkPressedPage(
      List(PressedCollectionBuilder.mkPressedCollection("fixed/showcase")),
    )

    FrontChecks.hasOnlySupportedCollections(faciaPage) should be(false)
  }

}

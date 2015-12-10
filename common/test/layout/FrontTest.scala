package layout

import com.gu.contentapi.client.model.{Content => ApiContent}
import com.gu.facia.api.models.{FaciaContent, LatestSnap}
import com.gu.facia.api.utils._
import contentapi.FixtureTemplates.emptyApiContent
import implicits.FaciaContentImplicits._
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.OneAppPerSuite
import services.FaciaContentConvert
import slices._
import test.TestRequest

class FrontTest extends FlatSpec with Matchers with OneAppPerSuite {
  val testRequest = TestRequest()

  def trailWithUrl(theUrl: String): FaciaContent = FaciaContentConvert.contentToFaciaContent(
    emptyApiContent.copy(id = theUrl, webUrl = theUrl)
  )

  def dreamSnapWithUrl(theUrl: String) = {
    val content: ApiContent = new ApiContent(
      id = theUrl,
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Option(DateTime.now()),
      webTitle = "",
      webUrl = theUrl,
      apiUrl = "",
      fields = None,
      tags = Nil,
      elements = None,
      references = Nil,
      isExpired = None)

    LatestSnap(
      id = theUrl,
      maybeFrontPublicationDate = None,
      cardStyle = DefaultCardstyle,
      snapUri = None,
      snapCss = None,
      latestContent = Option(content),
      headline = None,
      href = None,
      trailText = None,
      group = "",
      image = None,
      properties = ContentProperties.fromResolvedMetaData(ResolvedMetaData.Default),
      byline = None,
      kicker = None)}




  "itemsVisible" should "return a correct count of items visible (not behind 'show more')" in {
    Front.itemsVisible(FixedContainers.fixedMediumFastXI.slices) shouldEqual 11
    Front.itemsVisible(FixedContainers.fixedMediumSlowVII.slices) shouldEqual 7
    /** Don't know why this is called 12 when it contains 9 items ... */
    Front.itemsVisible(FixedContainers.fixedMediumSlowXIIMpu.slices) shouldEqual 9
  }

  "deduplicate" should "not remove items from a dynamic container" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("one", "two"), Dynamic(DynamicFast), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "include items seen in a dynamic container in the set of urls for further deduplication" in {
    val (nowSeen, _, _) = Front.deduplicate(Set("/one", "/two"), Dynamic(DynamicFast), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set("/one", "/two", "/three")
  }

  it should "remove items from a fixed container" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("/one", "/two"), Fixed(FixedContainers.fixedMediumFastXI), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("three")
  }

  it should "include items seen in a fixed container in the set of urls for further deduplication" in {
    val (nowSeen, _, _) = Front.deduplicate(Set("/one", "/two"), Fixed(FixedContainers.fixedMediumFastXI), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set("/one", "/two", "/three")
  }

  it should "not remove items from a nav list" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("/one", "/two"), NavList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "not include items seen in a nav list in the set of urls for further deduplication" in {
    val (nowSeen, _, _) = Front.deduplicate(Set("/one", "/two"), NavList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set("/one", "/two")
  }

  it should "not remove items from a nav media list" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("one", "two"), NavMediaList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "not include items seen in a singleton container in the set of urls for further deduplication" in {
    val (nowSeen, _, _) = Front.deduplicate(Set.empty, Fixed(FixedContainers.thrasher), Seq(
      trailWithUrl("one")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set.empty
  }

  it should "not remove items from a singleton container" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("one"), Fixed(FixedContainers.thrasher), Seq(
      trailWithUrl("one")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one")
  }

  it should "not include items seen in a nav media list in the set of urls for further deduplication" in {
    val (nowSeen, _, _) = Front.deduplicate(Set("/one", "/two"), NavMediaList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set("/one", "/two")
  }

  it should "not remove items from most popular" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("/one", "/two"), MostPopular, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "not include items seen in most popular in the set of urls for further deduplication" in {
    val (nowSeen, _, _) = Front.deduplicate(Set("/one", "/two"), MostPopular, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set("/one", "/two")
  }

  it should "not deduplicate dream snaps" in {
    val (_, dedupedTrails, _) = Front.deduplicate(Set("one", "two"), Fixed(FixedContainers.fixedMediumFastXI), Seq(
      dreamSnapWithUrl("one")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one")
  }

  it should "not skip dream snaps when considering items visible to be added to the set of seen urls" in {
    val (nowSeen, _, _) = Front.deduplicate(Set.empty, Fixed(FixedContainers.fixedSmallSlowIV), Seq(
      dreamSnapWithUrl("one"),
      dreamSnapWithUrl("two"),
      trailWithUrl("three"),
      trailWithUrl("four"),
      trailWithUrl("five"),
      trailWithUrl("six")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set("/three", "/four")
  }

  it should "not include dream snaps in the seen urls" in {
    val (nowSeen, _, _) = Front.deduplicate(Set.empty, Fixed(FixedContainers.fixedMediumFastXI), Seq(
      dreamSnapWithUrl("one")
    ), isNetworkFront = false, isEditorialFront = false)(testRequest)

    nowSeen shouldEqual Set()
  }
}

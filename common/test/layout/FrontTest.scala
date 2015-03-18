package layout

import com.gu.facia.api.models.{LatestSnap, FaciaContent}
import model.{ApiContentWithMeta, Content}
import org.joda.time.DateTime
import org.scalatest.{Matchers, FlatSpec}
import services.FaciaContentConvert
import slices._
import com.gu.contentapi.client.model.{Content => ApiContent}
import contentapi.FixtureTemplates.emptyApiContent
import implicits.FaciaContentImplicits._

class FrontTest extends FlatSpec with Matchers {
  def trailWithUrl(theUrl: String): FaciaContent = FaciaContentConvert.frontentContentToFaciaContent(new Content(ApiContentWithMeta(
      emptyApiContent.copy(id = theUrl, webUrl = theUrl),
      Nil
    )) {
      override lazy val url: String = theUrl

      override lazy val webUrl: String = theUrl
    }
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
      snapUri = None,
      snapCss = None,
      latestContent = Option(content),
      headline = None,
      href = None,
      trailText = None,
      group = "",
      image = None,
      isBreaking = false,
      isBoosted = false,
      imageHide = false,
      imageReplace = false,
      showMainVideo = false,
      showKickerTag = false,
      byline = None,
      showByLine = false,
      kicker = None,
      imageCutout = None,
      showBoostedHeadline = false,
      showQuotedHeadline = false)}




  "itemsVisible" should "return a correct count of items visible (not behind 'show more')" in {
    Front.itemsVisible(FixedContainers.fixedMediumFastXI) shouldEqual 11
    Front.itemsVisible(FixedContainers.fixedMediumSlowVII) shouldEqual 7
    /** Don't know why this is called 12 when it contains 9 items ... */
    Front.itemsVisible(FixedContainers.fixedMediumSlowXIIMpu) shouldEqual 9
  }

  "deduplicate" should "not remove items from a dynamic container" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("one", "two"), Dynamic(DynamicFast), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "include items seen in a dynamic container in the set of urls for further deduplication" in {
    val (nowSeen, _) = Front.deduplicate(Set("/one", "/two"), Dynamic(DynamicFast), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    nowSeen shouldEqual Set("/one", "/two", "/three")
  }

  it should "remove items from a fixed container" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("/one", "/two"), Fixed(FixedContainers.fixedMediumFastXI), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("three")
  }

  it should "include items seen in a fixed container in the set of urls for further deduplication" in {
    val (nowSeen, _) = Front.deduplicate(Set("/one", "/two"), Fixed(FixedContainers.fixedMediumFastXI), Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    nowSeen shouldEqual Set("/one", "/two", "/three")
  }

  it should "not remove items from a nav list" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("/one", "/two"), NavList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "not include items seen in a nav list in the set of urls for further deduplication" in {
    val (nowSeen, _) = Front.deduplicate(Set("/one", "/two"), NavList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    nowSeen shouldEqual Set("/one", "/two")
  }

  it should "not remove items from a nav media list" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("one", "two"), NavMediaList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "not include items seen in a singleton container in the set of urls for further deduplication" in {
    val (nowSeen, _) = Front.deduplicate(Set.empty, Fixed(FixedContainers.thrasher), Seq(
      trailWithUrl("one")
    ))

    nowSeen shouldEqual Set.empty
  }

  it should "not remove items from a singleton container" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("one"), Fixed(FixedContainers.thrasher), Seq(
      trailWithUrl("one")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one")
  }

  it should "not include items seen in a nav media list in the set of urls for further deduplication" in {
    val (nowSeen, _) = Front.deduplicate(Set("/one", "/two"), NavMediaList, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    nowSeen shouldEqual Set("/one", "/two")
  }

  it should "not remove items from most popular" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("/one", "/two"), MostPopular, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one", "two", "three")
  }

  it should "not include items seen in most popular in the set of urls for further deduplication" in {
    val (nowSeen, _) = Front.deduplicate(Set("/one", "/two"), MostPopular, Seq(
      trailWithUrl("one"),
      trailWithUrl("two"),
      trailWithUrl("three")
    ))

    nowSeen shouldEqual Set("/one", "/two")
  }

  it should "not deduplicate dream snaps" in {
    val (_, dedupedTrails) = Front.deduplicate(Set("one", "two"), Fixed(FixedContainers.fixedMediumFastXI), Seq(
      dreamSnapWithUrl("one")
    ))

    dedupedTrails.flatMap(_.webUrl) shouldEqual Seq("one")
  }

  it should "not skip dream snaps when considering items visible to be added to the set of seen urls" in {
    val (nowSeen, _) = Front.deduplicate(Set.empty, Fixed(FixedContainers.fixedSmallSlowIV), Seq(
      dreamSnapWithUrl("one"),
      dreamSnapWithUrl("two"),
      trailWithUrl("three"),
      trailWithUrl("four"),
      trailWithUrl("five"),
      trailWithUrl("six")
    ))

    nowSeen shouldEqual Set("/three", "/four")
  }

  it should "not include dream snaps in the seen urls" in {
    val (nowSeen, _) = Front.deduplicate(Set.empty, Fixed(FixedContainers.fixedMediumFastXI), Seq(
      dreamSnapWithUrl("one")
    ))

    nowSeen shouldEqual Set()
  }
}

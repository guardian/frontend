package layout.slices

import layout.ContainerDisplayConfig
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.scalacheck.ScalaCheckDrivenPropertyChecks
import layout.slices.ArbitraryStories._
import model.pressed.CollectionConfig
import services.CollectionConfigWithId
import model.pressed.DisplayHints

class FlexibleGeneralTest extends AnyFlatSpec with Matchers with ScalaCheckDrivenPropertyChecks {

  // return the appropriate number of slices depending on different maxItemsToDisplay values

  val exampleStories = Seq(
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
    Story(2, false),
  )

  val slicesFor: (Seq[Story], ContainerDisplayConfig) => Option[Seq[Slice]] = FlexibleGeneral.slicesFor

  val displayHints = DisplayHints(maxItemsToDisplay = Some(3))

  val config: CollectionConfig = CollectionConfig(
    displayName = None,
    backfill = None,
    metadata = None,
    collectionType = "",
    collectionLevel = None,
    href = None,
    description = None,
    groups = None,
    uneditable = false,
    showTags = false,
    showSections = false,
    hideKickers = false,
    showDateHeader = false,
    showLatestUpdate = false,
    excludeFromRss = false,
    showTimestamps = false,
    hideShowMore = false,
    displayHints = Some(displayHints),
    aspectRatio = Some(""),
  )

  val collectionConfigWithId = CollectionConfigWithId("test-collection-id", config)

  val testStories = storySeqGen(2)
  val testConfig = ContainerDisplayConfig.withDefaults(collectionConfigWithId)

  it should "Return 3 slices when config specifies max items display is 3" in {

    val slices = slicesFor(exampleStories, testConfig)
    println("slices ", slices)

    val sliceSeq = slices.get

    sliceSeq should have length 3

  }

}

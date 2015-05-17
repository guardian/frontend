package frontpress

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import model._
import org.scalatest.{DoNotDiscover, TryValues, Matchers, FlatSpec}
import com.gu.contentapi.client.model.{Content => ApiContent}
import services.CollectionConfigWithId
import test.ConfiguredTestSuite

@DoNotDiscover class FrontPressTest extends FlatSpec with Matchers with TryValues with ConfiguredTestSuite {
  val seoDataFixture = SeoData(
    "",
    "",
    "",
    None,
    None
  )

  val frontPropertiesFixture = FrontProperties(
    None,
    None,
    None,
    None,
    false,
    None
  )

  val configWithBackFill = CollectionConfigWithId("NoId", CollectionConfig.emptyConfig.copy(apiQuery = Some("")))

  val emptyCollection = Collection(
    Nil
  )

  val itemFixture = Content(ApiContentWithMeta(
    ApiContent(
      "",
      None,
      None,
      None,
      "",
      "",
      "",
      None,
      Nil,
      None
    )
  ))

  "generateJson" should "return an error if there are back fills and they are all empty" in {
    FrontPress.generateJson("", seoDataFixture, frontPropertiesFixture, List(
      configWithBackFill -> emptyCollection
    )).failure.exception.getMessage should include("back fills were empty")
  }

  it should "not return an error if there are no back fills" in {
    FrontPress.generateJson("", seoDataFixture, frontPropertiesFixture, List(
      CollectionConfigWithId("NoId", CollectionConfig.emptyConfig) -> emptyCollection
    )) should be a 'success
  }

  it should "not return an error if there are back fills and at least one has an item in results" in {
    FrontPress.generateJson("", seoDataFixture, frontPropertiesFixture, List(
      configWithBackFill -> emptyCollection.copy(results = Seq(itemFixture))
    )) should be a 'success
  }

  it should "not return an error if there are back fills and at least one has an item in most viewed" in {
    FrontPress.generateJson("", seoDataFixture, frontPropertiesFixture, List(
      configWithBackFill -> emptyCollection.copy(mostViewed = Seq(itemFixture))
    )) should be a 'success
  }

  it should "not return an error if there are back fills and at least one has an item in editor's picks" in {
    FrontPress.generateJson("", seoDataFixture, frontPropertiesFixture, List(
      configWithBackFill -> emptyCollection.copy(editorsPicks = Seq(itemFixture))
    )) should be a 'success
  }
}

package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.EmbedTracksType.{DoesNotTrack, EnumUnknownEmbedTracksType, Tracks, Unknown}
import com.gu.contentapi.client.model.v1._
import model.dotcomrendering.pageElements.PageElement.containsThirdPartyTracking
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json

class PageElementTest extends AnyFlatSpec with Matchers {
  "PageElement" should "classify capi tracking value correctly" in {
    containsThirdPartyTracking(None) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(DoesNotTrack))) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(Tracks))) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(Unknown))) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(EnumUnknownEmbedTracksType(99)))) should equal(true)
  }

  "RecipeBlockElement" should "deserialise a well-formed recipe" in {
    val json = Json.parse("""
      {
        "id": "cd0c0bec00e84712bbc4e9708efa4dfd",
        "title": "One-tray chicken, pasta and chickpea bake",
        "description": "A comforting dish.",
        "featuredImage": {
          "url": "https://media.guim.co.uk/abc/1598.jpg",
          "mediaId": "abc123",
          "cropId": "0_0_4299_5380",
          "source": "The Guardian",
          "photographer": "Phoebe Pearson",
          "caption": "The dish.",
          "imageType": "Photograph",
          "width": 1598,
          "height": 2000,
          "mediaApiUri": ""
        }
      }
    """)
    val result = json.validate[RecipeBlockElement]
    result.isSuccess should be(true)
    val recipe = result.get
    recipe.id should equal("cd0c0bec00e84712bbc4e9708efa4dfd")
    recipe.title should equal(Some("One-tray chicken, pasta and chickpea bake"))
    recipe.featuredImage.isDefined should be(true)
    recipe.featuredImage.map(_.cropId) should equal(Some("0_0_4299_5380"))
  }

  it should "degrade featuredImage to None when cropId is missing" in {
    val json = Json.parse("""
      {
        "id": "cd0c0bec00e84712bbc4e9708efa4dfd",
        "title": "One-tray chicken bake",
        "featuredImage": {
          "url": "https://media.guim.co.uk/abc/1598.jpg",
          "mediaId": "abc123"
        }
      }
    """)
    val result = json.validate[RecipeBlockElement]
    result.isSuccess should be(true)
    val recipe = result.get
    recipe.id should equal("cd0c0bec00e84712bbc4e9708efa4dfd")
    recipe.featuredImage should be(None)
  }

  it should "deserialise a recipe with no featuredImage" in {
    val json = Json.parse("""
      {
        "id": "31349f7beb6042efad992f8ff174287d",
        "title": "Spring vegetable and sumac salad",
        "description": "A fresh salad."
      }
    """)
    val result = json.validate[RecipeBlockElement]
    result.isSuccess should be(true)
    val recipe = result.get
    recipe.id should equal("31349f7beb6042efad992f8ff174287d")
    recipe.featuredImage should be(None)
  }

  it should "fail to deserialise when id is missing" in {
    val json = Json.parse("""
      {
        "title": "Missing id recipe"
      }
    """)
    json.validate[RecipeBlockElement].isError should be(true)
  }
}

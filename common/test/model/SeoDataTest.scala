package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class SeoDataTest extends AnyFlatSpec with Matchers {

  "SeoData" should "handle an path that has an edition" in {
    val seoData: SeoData = SeoData.fromPath("uk/culture")

    seoData.id should be("uk/culture")
    seoData.navSection should be("culture")
    seoData.webTitle should be("Culture")
    seoData.title.map(_ should include("Culture"))
    seoData.description.get should include("Culture")
  }

  it should "handle path with edition and one thing after" in {
    val seoData: SeoData = SeoData.fromPath("au/technology/games")

    seoData.navSection should be("technology")
    seoData.webTitle should be("Games")
    seoData.title.map(_ should include("Games"))
    seoData.description.get should include("Games")
  }

  it should "handle path with edition and other stuff after" in {
    val seoData: SeoData = SeoData.fromPath("au/technology/games/stuff")

    seoData.navSection should be("technology")
    seoData.webTitle should be("Games Stuff")
    seoData.title.map(_ should include("Games Stuff"))
    seoData.description.get should include("Games Stuff")
  }

  it should "handle path without edition" in {
    val seoData: SeoData = SeoData.fromPath("abc/def")

    seoData.id should be("abc/def")
    seoData.navSection should be("abc")
    seoData.webTitle should be("Def")
    seoData.title.map(_ should include("Def"))
    seoData.description.get should include("Def")
  }

  it should "handle one word" in {
    val seoData: SeoData = SeoData.fromPath("something-here")

    seoData.id should be("something-here")
    seoData.navSection should be("something-here")
    seoData.webTitle should be("Something Here")
    seoData.title.map(_ should include("Something Here"))
    seoData.description.get should include("Something Here")
  }

  it should "turn dashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games-and-things")

    seoData.id should be("technology/games-and-things")
    seoData.navSection should be("technology")
    seoData.webTitle should be("Games And Things")
    seoData.title.map(_ should include("Games And Things"))
    seoData.description.get should include("Games And Things")
  }

  it should "turn slashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games/and/things")

    seoData.id should be("technology/games/and/things")
    seoData.navSection should be("technology")
    seoData.webTitle should be("Games And Things")
    seoData.title.map(_ should include("Games And Things"))
    seoData.description.get should include("Games And Things")
  }

  it should "turn a mix of dashes and slashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games-and-things/sony")

    seoData.id should be("technology/games-and-things/sony")
    seoData.navSection should be("technology")
    seoData.webTitle should be("Games And Things Sony")
    seoData.title.map(_ should include("Games And Things Sony"))
    seoData.description.get should include("Games And Things Sony")
  }

}

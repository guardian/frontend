package model

import org.scalatest.{FlatSpec, Matchers}

class SeoDataTest extends FlatSpec with Matchers {

  "SeoData" should "handle an path that has an edition" in {
    val seoData: SeoData = SeoData.fromPath("uk/culture")

    seoData.id should be("uk/culture")
    seoData.section should be (Some("culture"))
    seoData.webTitle should be (Some("Culture"))
    seoData.title.get should include ("Culture")
    seoData.description.get should include ("Culture")
  }

  it should "handle path with edition and one thing after" in {
    val seoData: SeoData = SeoData.fromPath("au/technology/games")

    seoData.section should be (Some("technology"))
    seoData.webTitle should be (Some("Games"))
    seoData.title.get should include ("Games")
    seoData.description.get should include ("Games")
  }

  it should "handle path with edition and other stuff after" in {
    val seoData: SeoData = SeoData.fromPath("au/technology/games/stuff")

    seoData.section should be (Some("technology"))
    seoData.webTitle should be (Some("Games Stuff"))
    seoData.title.get should include ("Games Stuff")
    seoData.description.get should include ("Games Stuff")
  }

  it should "handle path without edition" in {
    val seoData: SeoData = SeoData.fromPath("abc/def")

    seoData.id should be("abc/def")
    seoData.section should be (Some("abc"))
    seoData.webTitle should be (Some("Def"))
    seoData.title.get should include ("Def")
    seoData.description.get should include ("Def")
  }

  it should "handle one word" in {
    val seoData: SeoData = SeoData.fromPath("somethinghere")

    seoData.id should be("somethinghere")
    seoData.section should be (Some("somethinghere"))
    seoData.webTitle should be (Some("Somethinghere"))
    seoData.title.get should include ("Somethinghere")
    seoData.description.get should include ("Somethinghere")
  }

  it should "turn dashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games-and-things")

    seoData.id should be("technology/games-and-things")
    seoData.section should be (Some("technology"))
    seoData.webTitle should be (Some("Games And Things"))
    seoData.title.get should include ("Games And Things")
    seoData.description.get should include ("Games And Things")
  }

  it should "turn slashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games/and/things")

    seoData.id should be("technology/games/and/things")
    seoData.section should be (Some("technology"))
    seoData.webTitle should be (Some("Games And Things"))
    seoData.title.get should include ("Games And Things")
    seoData.description.get should include ("Games And Things")
  }

  it should "turn a mix of dashes and slashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games-and-things/sony")

    seoData.id should be("technology/games-and-things/sony")
    seoData.section should be (Some("technology"))
    seoData.webTitle should be (Some("Games And Things Sony"))
    seoData.title.get should include ("Games And Things Sony")
    seoData.description.get should include ("Games And Things Sony")
  }


}

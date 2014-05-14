package model

import org.scalatest.{FlatSpec, Matchers}

class SeoDataTest extends FlatSpec with Matchers {

  "SeoData" should "handle an path that has an edition" in {
    val seoData: SeoData = SeoData.fromPath("uk/culture")

    seoData.id should be("uk/culture")
    seoData.section should be ("culture")
    seoData.webTitle should be ("Culture")
    seoData.title should include ("Culture")
    seoData.description.get should include ("Culture")
  }

  it should "handle path with edition and one thing after" in {
    val seoData: SeoData = SeoData.fromPath("au/technology/games")

    seoData.section should be ("technology")
    seoData.webTitle should be ("Games")
    seoData.title should include ("Games")
    seoData.description.get should include ("Games")
  }

  it should "handle path with edition and other stuff after" in {
    val seoData: SeoData = SeoData.fromPath("au/technology/games/stuff")

    seoData.section should be ("technology")
    seoData.webTitle should be ("Games Stuff")
    seoData.title should include ("Games Stuff")
    seoData.description.get should include ("Games Stuff")
  }

  it should "handle path without edition" in {
    val seoData: SeoData = SeoData.fromPath("abc/def")

    seoData.id should be("abc/def")
    seoData.section should be ("abc")
    seoData.webTitle should be ("Def")
    seoData.title should include ("Def")
    seoData.description.get should include ("Def")
  }

  it should "handle one word" in {
    val seoData: SeoData = SeoData.fromPath("somethinghere")

    seoData.id should be("somethinghere")
    seoData.section should be ("somethinghere")
    seoData.webTitle should be ("Somethinghere")
    seoData.title should include ("Somethinghere")
    seoData.description.get should include ("Somethinghere")
  }

  it should "turn dashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games-and-things")

    seoData.id should be("technology/games-and-things")
    seoData.section should be ("technology")
    seoData.webTitle should be ("Games And Things")
    seoData.title should include ("Games And Things")
    seoData.description.get should include ("Games And Things")
  }

  it should "turn slashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games/and/things")

    seoData.id should be("technology/games/and/things")
    seoData.section should be ("technology")
    seoData.webTitle should be ("Games And Things")
    seoData.title should include ("Games And Things")
    seoData.description.get should include ("Games And Things")
  }

  it should "turn a mix of dashes and slashes into spaces" in {
    val seoData: SeoData = SeoData.fromPath("technology/games-and-things/sony")

    seoData.id should be("technology/games-and-things/sony")
    seoData.section should be ("technology")
    seoData.webTitle should be ("Games And Things Sony")
    seoData.title should include ("Games And Things Sony")
    seoData.description.get should include ("Games And Things Sony")
  }


}

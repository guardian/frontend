package controllers

import model.MetaData


abstract class FrontPage(val isNetworkFront: Boolean) extends MetaData

object FrontPage {

  private val fronts = Seq(

    new FrontPage(isNetworkFront = false) {
      override val id = "sport"
      override val section = "sport"
      override val webTitle = "Sport news, comment and results"
      override lazy val analyticsName = "GFE:sport"
      override lazy val description = Some("Latest sport news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Sport",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "money"
      override val section = "money"
      override val webTitle = "Personal finance and money news, analysis and comment"
      override lazy val analyticsName = "GFE:money"
      override lazy val description = Some("Latest money news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Money",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "commentisfree"
      override val section = "commentisfree"
      override val webTitle = "Comment is free"
      override lazy val analyticsName = "GFE:commentisfree"
      override lazy val description = Some("Latest comment is free news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Comment is free",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "business"
      override val section = "business"
      override val webTitle = "Latest financial, market &amp; economic news and analysis"
      override lazy val analyticsName = "GFE:business"
      override lazy val description = Some("Latest business news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Business",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "culture"
      override val section = "culture"
      override val webTitle = "Culture"
      override lazy val analyticsName = "GFE:culture"
      override lazy val description = Some("Latest culture news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Culture",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = true) {
      override val id = "uk-alpha"
      override val section = ""
      override val webTitle = "Latest news, sport and comment from the Guardian"
      override lazy val analyticsName = "GFE:Network Front Alpha"
      override lazy val description = Some("Latest news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = true) {
      override val id = "au-alpha"
      override val section = ""
      override val webTitle = "Latest news, sport and comment from the Guardian"
      override lazy val analyticsName = "GFE:Network Front Alpha"
      override lazy val description = Some("Latest news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = true) {
      override val id = "us-alpha"
      override val section = ""
      override val webTitle = "Latest news, sport and comment from the Guardian"
      override lazy val analyticsName = "GFE:Network Front Alpha"
      override lazy val description = Some("Latest news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "business/companies"
      override val section = "business"
      override val webTitle = "Companies"
      override lazy val analyticsName = "GFE:Business"
      override lazy val description = Some("Latest busines news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Business",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "world/asia"
      override val section = "world"
      override val webTitle = "Asia"
      override lazy val analyticsName = "GFE:World"
      override lazy val description = Some("Latest Asian news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "World",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "lifeandstyle/love-and-sex"
      override val section = "lifeandstyle"
      override val webTitle = "Love and sex"
      override lazy val analyticsName = "GFE:Life and style"
      override lazy val description = Some("Latest love and sex news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Life and style",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "lifeandstyle/home-and-garden"
      override val section = "lifeandstyle"
      override val webTitle = "Home and garden"
      override lazy val analyticsName = "GFE:Life and style"
      override lazy val description = Some("Latest home and garden news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Life and style",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "football"
      override val section = "football"
      override val webTitle = "Football news, match reports and fixtures"
      override lazy val analyticsName = "GFE:Football"
      override lazy val description = Some("Latest football news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Football",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "uk-news"
      override val section = "uk-news"
      override val webTitle = "Latest UK news and comment"
      override lazy val analyticsName = "GFE:UK News"

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "UK News",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "world"
      override val section = "world"
      override val webTitle = "World news and comment from the Guardian"
      override lazy val analyticsName = "GFE:World"
      override lazy val description = Some("Latest world news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "World",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "lifeandstyle"
      override val section = "Life and style"
      override val webTitle = "The Guardian"
      override lazy val analyticsName = "GFE:Life and style"
      override lazy val description = Some("Latest life and style, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Life and style",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    //TODO important this one is last for matching purposes
    new FrontPage(isNetworkFront = true) {
      override val id = ""
      override val section = ""
      override val webTitle = "Latest news, sport and comment from the Guardian"
      override lazy val analyticsName = "GFE:Network Front"
      override lazy val description = Some("Latest news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    }
  )

  def apply(path: String): Option[FrontPage] = fronts.find(f => path.endsWith(f.id))

}


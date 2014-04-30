package controllers

import model.{FaciaPage, MetaData}
import conf.Switches

abstract class FrontPage(val isNetworkFront: Boolean) extends MetaData {
  override lazy val rssPath = Some(s"/$id/rss")
}

object SwitchingFrontPage {

  def apply(faciaPage: FaciaPage): FrontPage =
    if (Switches.AutoSeoSwitch.isSwitchedOn)
      FrontPage.getFrontPageFromFaciaPage(faciaPage)
    else
      OldFrontPage.apply(faciaPage)

}

object FrontPage {

  val defaultDescription: String = "Latest news, comment and analysis from the Guardian, the world’s leading liberal voice"
  val networkFrontAnalytics: String = "GFE:Network Front"
  val defaultWebTitle: String = "Latest news, sport and comment from the Guardian"

  val networkFrontContentType: String = "Network Front"

  val defaultFrontPage: FrontPage = new FrontPage(isNetworkFront = true) {
    override val id = ""
    override val section = ""
    override val webTitle = defaultWebTitle
    override lazy val analyticsName = networkFrontAnalytics
    override lazy val description = Some(defaultDescription)

    override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
      "content-type" -> networkFrontContentType,
      "is-front" -> true
    )
  }

  private def getId(keyword: String): String = keyword.toLowerCase
  private def getSection(keyword: String): String = keyword.toLowerCase
  private def getAnalyticsName(keyword: String): String = s"GFE:${keyword.toLowerCase}"
  private def getDescription(keyword: String): String = s"Latest $keyword news, comment and analysis from the Guardian, the world’s leading liberal voice"

  def getFrontPageFromFaciaPage(faciaPage: FaciaPage): FrontPage = faciaPage.keyword.map { k =>
    new FrontPage(isNetworkFront = false) {
      override val id = getId(k)
      override val section = getSection(k)
      override val webTitle = faciaPage.webTitle
        .orElse(faciaPage.keyword.map(getDescription))
        .getOrElse(defaultDescription)
      override lazy val analyticsName = getAnalyticsName(k)
      override lazy val description = Some(getDescription(k))

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> k.capitalize,
        "content-type" -> k.capitalize,
        "is-front" -> true //Config agent trait logic?
      )
    }
  }.getOrElse(defaultFrontPage)
}

object OldFrontPage {

  private val fronts = Seq(

    new FrontPage(isNetworkFront = false) {
      override val id = "sport"
      override val section = "sport"
      override val webTitle = "Sport news, comment and results"
      override lazy val analyticsName = "GFE:sport"
      override lazy val description = Some("Sport news, results, fixtures, blogs and comments on UK and world sport from the Guardian, the world's leading liberal voice")

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
      override lazy val description = Some("Latest personal finance and money news, comment and information on your property, mortgages, insurance, savings and investments from the Guardian, the world's leading liberal voice")

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
      override lazy val description = Some("Latest comment, analysis and discussion from the Guardian. CP Scott: &quot;Comment is free, but facts are sacred&quot;")

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
      override lazy val description = Some("Latest financial, market &amp; economic news and analysis")

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
      override lazy val description = Some("Culture news, comment, video and pictures from The Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Culture",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "business/companies"
      override val section = "business"
      override val webTitle = "Companies"
      override lazy val analyticsName = "GFE:Companies"
      override lazy val description = Some("Latest company news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Companies",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "world/asia"
      override val section = "world"
      override val webTitle = "Asia"
      override lazy val analyticsName = "GFE:Asia"
      override lazy val description = Some("Latest Asian news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Asia",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "lifeandstyle/love-and-sex"
      override val section = "Life and style"
      override val webTitle = "Love and sex"
      override lazy val analyticsName = "GFE:Love and sex"
      override lazy val description = Some("Sex and relationship advice from the Guardian. Sexual health matters, sexuality, information and sex tips all discussed")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Life and style",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "lifeandstyle/home-and-garden"
      override val section = "Life and style"
      override val webTitle = "Home and garden"
      override lazy val analyticsName = "GFE:Home and garden"
      override lazy val description = Some("Latest home and garden news, comment and analysis from the Guardian, the world’s leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Home and garden",
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
      override val webTitle = "Life"
      override lazy val analyticsName = "GFE:Life and style"
      override lazy val description = Some("Latest news and comment on life and style from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Life and style",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
      
    new FrontPage(isNetworkFront = false) {
      override val id = "education"
      override val section = "Education"
      override val webTitle = "Education news, comment and analysis"
      override lazy val analyticsName = "GFE:Education"
      override lazy val description = Some("Latest education news, comment and analysis on schools, colleges, universities, further and higher education and teaching from the Guardian, the world's leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Education",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    
    new FrontPage(isNetworkFront = false) {
      override val id = "fashion"
      override val section = "fashion"
      override val webTitle = "Fashion news, advice and pictures"
      override lazy val analyticsName = "GFE:Fashion"
      override lazy val description = Some("The latest fashion news, advice and comment  from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Fashion",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    
    new FrontPage(isNetworkFront = false) {
      override val id = "science"
      override val section = "science"
      override val webTitle = "Science"
      override lazy val analyticsName = "GFE:Science"
      override lazy val description = Some("Latest news and comment on Science from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Science",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "travel"
      override val section = "travel"
      override val webTitle = "Travel news, travel guides and reviews"
      override lazy val analyticsName = "GFE:Travel"
      override lazy val description = Some("Latest travel news and reviews on UK and world holidays, travel guides to global destinations, city breaks, hotels and restaurant information from the Guardian, the world's leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Travel",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    
    new FrontPage(isNetworkFront = false) {
      override val id = "world/usa"
      override val section = "world"
      override val webTitle = "United States"
      override lazy val analyticsName = "GFE:US News"
      override lazy val description = Some("Latest news and comment on United States from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "US News",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    new FrontPage(isNetworkFront = false) {
      override val id = "environment"
      override val section = "environment"
      override val webTitle = " Environment news, comment and analysis from the Guardian"
      override lazy val analyticsName = "GFE:Environment"
      override lazy val description = Some("Environment news, comment and discussion on key green, environmental and climate change issues from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Environment",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    new FrontPage(isNetworkFront = false) {
      override val id = "technology"
      override val section = "technology"
      override val webTitle = " Technology news, comment and analysis"
      override lazy val analyticsName = "GFE:Technology"
      override lazy val description = Some("Latest technology news, comment and analysis from the Guardian, the world's leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Technology",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "education"
      override val section = "Education"
      override val webTitle = "Education news, comment and analysis"
      override lazy val analyticsName = "GFE:Education"
      override lazy val description = Some("Latest education news, comment and analysis on schools, colleges, universities, further and higher education and teaching from the Guardian, the world's leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Education",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "fashion"
      override val section = "fashion"
      override val webTitle = "Fashion news, advice and pictures"
      override lazy val analyticsName = "GFE:Fashion"
      override lazy val description = Some("The latest fashion news, advice and comment  from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Fashion",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "science"
      override val section = "science"
      override val webTitle = "Science"
      override lazy val analyticsName = "GFE:Science"
      override lazy val description = Some("Latest news and comment on Science from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Science",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "travel"
      override val section = "travel"
      override val webTitle = "Travel news, travel guides and reviews"
      override lazy val analyticsName = "GFE:Travel"
      override lazy val description = Some("Latest travel news and reviews on UK and world holidays, travel guides to global destinations, city breaks, hotels and restaurant information from the Guardian, the world's leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Travel",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },

    new FrontPage(isNetworkFront = false) {
      override val id = "world/usa"
      override val section = "world"
      override val webTitle = "United States"
      override lazy val analyticsName = "GFE:US News"
      override lazy val description = Some("Latest news and comment on United States from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "US News",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    new FrontPage(isNetworkFront = false) {
      override val id = "environment"
      override val section = "environment"
      override val webTitle = " Environment news, comment and analysis from the Guardian"
      override lazy val analyticsName = "GFE:Environment"
      override lazy val description = Some("Environment news, comment and discussion on key green, environmental and climate change issues from the Guardian")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Environment",
        "content-type" -> "Section",
        "is-front" -> true
      )
    },
    new FrontPage(isNetworkFront = false) {
      override val id = "technology"
      override val section = "technology"
      override val webTitle = " Technology news, comment and analysis"
      override lazy val analyticsName = "GFE:Technology"
      override lazy val description = Some("Latest technology news, comment and analysis from the Guardian, the world's leading liberal voice")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "keywords" -> "Technology",
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
      override lazy val rssPath = Some(s"/rss")

      override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
        "content-type" -> "Network Front",
        "is-front" -> true
      )
    }
  )

  def apply(faciaPage: FaciaPage): FrontPage = fronts.find(f => faciaPage.id.endsWith(f.id)).get
}

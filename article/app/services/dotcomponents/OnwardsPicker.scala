package services.dotcomponents

import agents.CuratedContentAgent
import common.Edition
import model.DotcomContentType.{Interactive, Video}
import model.dotcomrendering.{
  CSROnwardsCollectionResponse,
  OnwardCollectionResponse,
  OnwardsCollection,
  OnwardsSource,
  Trail,
}
import model.{ArticlePage, ContentFormat}
import play.api.mvc.RequestHeader
import views.support.Commercial.isPaidContent

object PopularTags {
  val allowedTags = Seq(
    // sport tags
    "sport/cricket",
    "sport/rugby-union",
    "sport/rugbyleague",
    "sport/formulaone",
    "sport/tennis",
    "sport/cycling",
    "sport/motorsports",
    "sport/golf",
    "sport/horse-racing",
    "sport/boxing",
    "port/us-sport",
    "sport/australia-sport",
    // football tags
    "football/championsleague",
    "football/premierleague",
    "football/championship",
    "football/europeanfootball",
    "football/world-cup-2014",
    // football team tags
    "football/manchester-united",
    "football/chelsea",
    "football/arsenal",
    "football/manchestercity",
    "football/tottenham-hotspur",
    "football/liverpool",
  )
}

class OnwardsPicker(curatedContentAgent: CuratedContentAgent) {
  def forArticle(article: ArticlePage, edition: Edition)(implicit
      // It'd be nice to not have this required here, but it's required in `pressedContentToTrail`
      // and drilled pretty deep from there.
      request: RequestHeader,
  ): Seq[OnwardsCollection] = {
    val format = article.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat)

    /** This is a stop-gap until we render everything on the server.
      * It exists as we lose context of the article when Frontend needs to POST to DCR via the onward service.
      * i.e.
      *
      * Frontend => DCR
      *   { "onwards": { "url": "https://gu-api.com/series/series-id?formatDesign=ArticleDesign&formatTheme=NewsPillar&formatDisplay=StandardDisplay" }}
      *
      * DCR => GET https://gu-api.com/url/above => Frontend
      *
      * Frontend parseFormatQueryString => POST DCR {
      *   "format": {
      *     "design": "ArticleDesign",
      *     "formatTheme": "NewsPillar",
      *     "formatDisplay": "StandardDisplay"
      *   }
      * }
      */
    val formatString = s"formatDesign=${format.design}&formatTheme=${format.theme}&formatDisplay=${format.display}"

    val curatedContent = curatedContentAgent.getTrails(format.theme, edition)

    val storyPackage = article.related.faciaItems match {
      case Nil => None
      case faciaItems =>
        Some(
          OnwardCollectionResponse(
            heading = "More on this story",
            trails = faciaItems.map(faciaItem => Trail.pressedContentToTrail(faciaItem)).take(10),
            onwardsSource = OnwardsSource.MoreOnThisStory,
            format = format,
          ),
        )
    }

    val series =
      article.item.tags.series.headOption.map(tag =>
        CSROnwardsCollectionResponse(
          tag.name,
          OnwardsSource.Series,
          format,
          s"/onwards/series/${tag.id}?$formatString",
        ),
      )

    // For paid content we just use the first tag
    // otherwise we use the allow list on keywords
    val isPaidContent = article.metadata.commercial.exists(_.isPaidContent)
    val tag =
      if (isPaidContent) article.item.tags.tags.headOption
      else
        article.item.tags.keywords
          .find(PopularTags.allowedTags.contains)

    val excludeTags: Seq[String] = Seq(
      // We don't want to show professional network content on videos or interactives
      article.metadata.contentType.map {
        case Video | Interactive => s"guardian-professional/guardian-professional?$formatString"
      },
      // Exclude ad features from non-ad feature content
      if (isPaidContent) Some("tone/advertisement-features") else None,
    ).flatten

    val popularInTag = tag map { tag =>
      CSROnwardsCollectionResponse(
        "Related content",
        OnwardsSource.PopularInTag,
        format,
        s"/onwards/popular-in-tag/${tag.id}?$formatString&${excludeTags.map(tag => s"exclude-tags=${tag}").mkString("&")}",
      )
    }

    val relatedStories = CSROnwardsCollectionResponse(
      "Related stories",
      OnwardsSource.RelatedStories,
      format,
      s"/onwards/related-stories/${article.metadata.id}?$formatString",
    )

    val onwards = storyPackage
      .orElse(series)
      .orElse(popularInTag)
      .getOrElse(relatedStories)

    Seq(
      OnwardCollectionResponse(
        heading = s"More from ${format.theme}",
        trails = curatedContent,
        onwardsSource = OnwardsSource.CuratedContent,
        format = format,
      ),
      onwards,
    )
  }
}

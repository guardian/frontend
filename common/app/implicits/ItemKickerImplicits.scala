package implicits

import model.pressed._

object ItemKickerImplicits {
  val fcSublinkKicker = "fc-sublink__kicker"
  val fcSublinkLiveIndicator = "fc-sublink__live-indicator"

  val fcItemKicker = "fc-item__kicker"
  val fcItemKickerBreakingNews = "fc-item__kicker--breaking-news"

  implicit class RichItemKicker(itemKicker: ItemKicker) {

    def sublinkClasses: Set[String] = itemKicker match {
      case BreakingNewsKicker => Set(fcSublinkKicker, fcSublinkLiveIndicator)
      case LiveKicker => Set(fcSublinkKicker, fcSublinkLiveIndicator)
      case AnalysisKicker => Set(fcSublinkKicker)
      case ReviewKicker => Set(fcSublinkKicker)
      case CartoonKicker => Set(fcSublinkKicker)
      case PodcastKicker(_, series) => Set(fcSublinkKicker)
      case TagKicker(_, name, url, id) => Set(fcSublinkKicker)
      case SectionKicker(_, name, url) => Set(fcSublinkKicker)
      case FreeHtmlKicker(_, body) => Set(fcSublinkKicker)
      case FreeHtmlKickerWithLink(_, body, url) => Set(fcSublinkKicker)
    }

    def linkClasses: Set[String] = itemKicker match {
      case BreakingNewsKicker => Set(fcItemKicker, fcItemKickerBreakingNews)
      case LiveKicker => Set(fcItemKicker, fcItemKickerBreakingNews)
      case AnalysisKicker => Set(fcItemKicker)
      case ReviewKicker => Set(fcItemKicker)
      case CartoonKicker => Set(fcItemKicker)
      case PodcastKicker(_, series) => Set(fcItemKicker)
      case TagKicker(_, name, url, id) => Set(fcItemKicker)
      case SectionKicker(_, name, url) => Set(fcItemKicker)
      case FreeHtmlKicker(_, body) => Set(fcItemKicker)
      case FreeHtmlKickerWithLink(_, body, url) => Set(fcItemKicker)
    }

    def kickerHtml: String = itemKicker match {
      case BreakingNewsKicker => "Breaking news"
      case LiveKicker => "<span class=\"live-pulse-icon js-flashing-image\"></span>Live"
      case AnalysisKicker => "Analysis"
      case ReviewKicker => "Review"
      case CartoonKicker => "Cartoon"
      case PodcastKicker(_, series) => series.map(_.name).getOrElse("Podcast")
      case TagKicker(_, name, url, id) => name
      case SectionKicker(_, name, url) => name
      case FreeHtmlKicker(_, body) => body
      case FreeHtmlKickerWithLink(_, body, url) => body
    }

    def sublinkKickerHtml: String = itemKicker match {
      case BreakingNewsKicker => kickerHtml
      case LiveKicker => "Live"
      case AnalysisKicker => kickerHtml
      case ReviewKicker => kickerHtml
      case CartoonKicker => kickerHtml
      case PodcastKicker(_, series) => kickerHtml
      case TagKicker(_, name, url, id) => kickerHtml
      case SectionKicker(_, name, url) => kickerHtml
      case FreeHtmlKicker(_, body) => kickerHtml
      case FreeHtmlKickerWithLink(_, body, url) => kickerHtml
    }

    def link: Option[String] = itemKicker match {
      case BreakingNewsKicker => None
      case LiveKicker => None
      case AnalysisKicker => None
      case ReviewKicker => None
      case CartoonKicker => None
      case PodcastKicker(_, series) => series.map(_.url)
      case TagKicker(_, name, url, id) => Option(url)
      case SectionKicker(_, name, url) => Option(url)
      case FreeHtmlKicker(_, body) => None
      case FreeHtmlKickerWithLink(_, body, url) => Option(url)
    }
  }

}

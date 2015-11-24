package implicits

import com.gu.facia.api.utils._

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
      case PodcastKicker(series) => Set(fcSublinkKicker)
      case TagKicker(name, url, id) => Set(fcSublinkKicker)
      case SectionKicker(name, url) => Set(fcSublinkKicker)
      case FreeHtmlKicker(body) => Set(fcSublinkKicker)
      case FreeHtmlKickerWithLink(body, url) => Set(fcSublinkKicker)
    }

    def linkClasses: Set[String] = itemKicker match {
      case BreakingNewsKicker => Set(fcItemKicker, fcItemKickerBreakingNews)
      case LiveKicker => Set(fcItemKicker, fcItemKickerBreakingNews)
      case AnalysisKicker => Set(fcItemKicker)
      case ReviewKicker => Set(fcItemKicker)
      case CartoonKicker => Set(fcItemKicker)
      case PodcastKicker(series) => Set(fcItemKicker)
      case TagKicker(name, url, id) => Set(fcItemKicker)
      case SectionKicker(name, url) => Set(fcItemKicker)
      case FreeHtmlKicker(body) => Set(fcItemKicker)
      case FreeHtmlKickerWithLink(body, url) => Set(fcItemKicker)
    }

    def kickerHtml: String = itemKicker match {
      case BreakingNewsKicker => "Breaking news"
      case LiveKicker => "<span class=\"live-pulse-icon js-flashing-image\"></span>Live"
      case AnalysisKicker => "Analysis"
      case ReviewKicker => "Review"
      case CartoonKicker => "Cartoon"
      case PodcastKicker(series) => series.map(_.name).getOrElse("Podcast")
      case TagKicker(name, url, id) => name
      case SectionKicker(name, url) => name
      case FreeHtmlKicker(body) => body
      case FreeHtmlKickerWithLink(body, url) => body
    }

    def sublinkKickerHtml: String = itemKicker match {
      case BreakingNewsKicker => kickerHtml
      case LiveKicker => "Live"
      case AnalysisKicker => kickerHtml
      case ReviewKicker => kickerHtml
      case CartoonKicker => kickerHtml
      case PodcastKicker(series) => kickerHtml
      case TagKicker(name, url, id) => kickerHtml
      case SectionKicker(name, url) => kickerHtml
      case FreeHtmlKicker(body) => kickerHtml
      case FreeHtmlKickerWithLink(body, url) => kickerHtml
    }

    def link: Option[String] = itemKicker match {
      case BreakingNewsKicker => None
      case LiveKicker => None
      case AnalysisKicker => None
      case ReviewKicker => None
      case CartoonKicker => None
      case PodcastKicker(series) => series.map(_.url)
      case TagKicker(name, url, id) => Option(url)
      case SectionKicker(name, url) => Option(url)
      case FreeHtmlKicker(body) => None
      case FreeHtmlKickerWithLink(body, url) => Option(url)
    }

//    This is for the essential read AB test and should be deleted or refactored afterwards
    def EssentialReadShouldUseKicker: Boolean = itemKicker match {
      case BreakingNewsKicker => true
      case LiveKicker => false
      case AnalysisKicker => false
      case ReviewKicker => false
      case CartoonKicker => false
      case PodcastKicker(series) => false
      case TagKicker(name, url, id) => true
      case SectionKicker(name, url) => true
      case FreeHtmlKicker(body) => true
      case FreeHtmlKickerWithLink(body, url) => true
    }
  }

}

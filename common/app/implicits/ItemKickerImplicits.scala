package implicits

import model.pressed._

object ItemKickerImplicits {
  val fcSublinkKicker = "fc-sublink__kicker"
  val fcSublinkLiveIndicator = "fc-sublink__live-indicator"

  val fcItemKicker = "fc-item__kicker"
  val fcItemKickerBreakingNews = "fc-item__kicker--breaking-news"

  implicit class RichItemKicker(itemKicker: ItemKicker) {

    def sublinkClasses: Set[String] =
      itemKicker match {
        case BreakingNewsKicker        => Set(fcSublinkKicker, fcSublinkLiveIndicator)
        case LiveKicker                => Set(fcSublinkKicker, fcSublinkLiveIndicator)
        case AnalysisKicker            => Set(fcSublinkKicker)
        case ReviewKicker              => Set(fcSublinkKicker)
        case CartoonKicker             => Set(fcSublinkKicker)
        case _: PodcastKicker          => Set(fcSublinkKicker)
        case _: TagKicker              => Set(fcSublinkKicker)
        case _: SectionKicker          => Set(fcSublinkKicker)
        case _: FreeHtmlKicker         => Set(fcSublinkKicker)
        case _: FreeHtmlKickerWithLink => Set(fcSublinkKicker)
      }

    def linkClasses: Set[String] =
      itemKicker match {
        case BreakingNewsKicker        => Set(fcItemKicker, fcItemKickerBreakingNews)
        case LiveKicker                => Set(fcItemKicker, fcItemKickerBreakingNews)
        case AnalysisKicker            => Set(fcItemKicker)
        case ReviewKicker              => Set(fcItemKicker)
        case CartoonKicker             => Set(fcItemKicker)
        case _: PodcastKicker          => Set(fcItemKicker)
        case _: TagKicker              => Set(fcItemKicker)
        case _: SectionKicker          => Set(fcItemKicker)
        case _: FreeHtmlKicker         => Set(fcItemKicker)
        case _: FreeHtmlKickerWithLink => Set(fcItemKicker)
      }

    /**
      * @return a set of classes for kickers. It should be the same as the set returned by `linkClasses` for
      *         each case, except that it will include an extra class which removes the `:after` pseudo-element
      *         added by the standard kicker styles.
      *
     * This allows us to keep the rest of the kicker styling while just targeting the 'slash'. Once the
      * `RemoveKickerSlash` test has completed the original `.fc-item__kicker:after` rule should be removed,
      * and uses of this method should be switched back to using `linkClasses` instead.
      */
    def linkClassesWithoutSlash: Set[String] = {
      val WithoutSlash = "fc-item__kicker--without-slash"
      itemKicker match {
        case BreakingNewsKicker        => Set(fcItemKicker, WithoutSlash, fcItemKickerBreakingNews)
        case LiveKicker                => Set(fcItemKicker, WithoutSlash, fcItemKickerBreakingNews)
        case AnalysisKicker            => Set(fcItemKicker, WithoutSlash)
        case ReviewKicker              => Set(fcItemKicker, WithoutSlash)
        case CartoonKicker             => Set(fcItemKicker, WithoutSlash)
        case _: PodcastKicker          => Set(fcItemKicker, WithoutSlash)
        case _: TagKicker              => Set(fcItemKicker, WithoutSlash)
        case _: SectionKicker          => Set(fcItemKicker, WithoutSlash)
        case _: FreeHtmlKicker         => Set(fcItemKicker, WithoutSlash)
        case _: FreeHtmlKickerWithLink => Set(fcItemKicker, WithoutSlash)
      }
    }

    def kickerHtml: String =
      itemKicker match {
        case BreakingNewsKicker                 => "Breaking news"
        case LiveKicker                         => "<span class=\"live-pulse-icon flashing-image\"></span>Live"
        case AnalysisKicker                     => "Analysis"
        case ReviewKicker                       => "Review"
        case CartoonKicker                      => "Cartoon"
        case PodcastKicker(_, series)           => series.map(_.name).getOrElse("Podcast")
        case TagKicker(_, name, _, _)           => name
        case SectionKicker(_, name, _)          => name
        case FreeHtmlKicker(_, body)            => body
        case FreeHtmlKickerWithLink(_, body, _) => body
      }

    def sublinkKickerHtml: String =
      itemKicker match {
        case BreakingNewsKicker        => kickerHtml
        case LiveKicker                => "Live"
        case AnalysisKicker            => kickerHtml
        case ReviewKicker              => kickerHtml
        case CartoonKicker             => kickerHtml
        case _: PodcastKicker          => kickerHtml
        case _: TagKicker              => kickerHtml
        case _: SectionKicker          => kickerHtml
        case _: FreeHtmlKicker         => kickerHtml
        case _: FreeHtmlKickerWithLink => kickerHtml
      }

    def link: Option[String] =
      itemKicker match {
        case BreakingNewsKicker                => None
        case LiveKicker                        => None
        case AnalysisKicker                    => None
        case ReviewKicker                      => None
        case CartoonKicker                     => None
        case PodcastKicker(_, series)          => series.map(_.url)
        case TagKicker(_, _, url, _)           => Option(url)
        case SectionKicker(_, _, url)          => Option(url)
        case _: FreeHtmlKicker                 => None
        case FreeHtmlKickerWithLink(_, _, url) => Option(url)
      }
  }

}

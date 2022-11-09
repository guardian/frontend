package model.pressed

import com.gu.facia.api.{utils => fapiutils}

sealed trait CardStyle {
  def toneString: String
}

case object SpecialReport extends CardStyle { val toneString = fapiutils.CardStyle.specialReport }
case object SpecialReportAlt extends CardStyle { val toneString = fapiutils.CardStyle.specialReportAlt }
case object LiveBlog extends CardStyle { val toneString = fapiutils.CardStyle.live }
case object DeadBlog extends CardStyle { val toneString = fapiutils.CardStyle.dead }
case object Feature extends CardStyle { val toneString = fapiutils.CardStyle.feature }
case object Editorial extends CardStyle { val toneString = fapiutils.CardStyle.editorial }
case object Comment extends CardStyle { val toneString = fapiutils.CardStyle.comment }
case object Media extends CardStyle { val toneString = fapiutils.CardStyle.media }
case object Analysis extends CardStyle { val toneString = fapiutils.CardStyle.analysis }
case object Review extends CardStyle { val toneString = fapiutils.CardStyle.review }
case object Letters extends CardStyle { val toneString = fapiutils.CardStyle.letters }
case object ExternalLink extends CardStyle { val toneString = fapiutils.CardStyle.external }
case object DefaultCardstyle extends CardStyle { val toneString = fapiutils.CardStyle.news }

object CardStyle {
  def make(cardStyle: fapiutils.CardStyle): CardStyle =
    cardStyle match {
      case fapiutils.SpecialReport    => SpecialReport
      case fapiutils.SpecialReportAlt => SpecialReportAlt
      case fapiutils.LiveBlog         => LiveBlog
      case fapiutils.DeadBlog         => DeadBlog
      case fapiutils.Feature          => Feature
      case fapiutils.Editorial        => Editorial
      case fapiutils.Comment          => Comment
      case fapiutils.Media            => Media
      case fapiutils.Analysis         => Analysis
      case fapiutils.Review           => Review
      case fapiutils.Letters          => Letters
      case fapiutils.ExternalLink     => ExternalLink
      case fapiutils.DefaultCardstyle => DefaultCardstyle
    }
}

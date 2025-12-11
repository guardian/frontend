package views.support

import conf.Static
import layout.{ContentCard, EditionalisedLink}
import model._
import play.twirl.api.Html
import play.api.mvc._
import views.support.TrailCssClasses.toneClassFromStyle

object EmailHelpers {
  def imageUrlFromCard(contentCard: ContentCard, width: Int): Option[String] = {
    def imageUrl(displayElement: Option[FaciaDisplayElement]): Option[String] =
      displayElement.flatMap {
        case InlineImage(imageMedia)                   => FrontEmailImage(width).bestSrcFor(imageMedia)
        case InlineVideo(video, _, maybeFallbackImage) =>
          EmailVideoImage.bestSrcFor(video.images).orElse(imageUrl(maybeFallbackImage))
        case InlineYouTubeMediaAtom(atom, posterOverride) =>
          posterOverride.orElse(atom.posterImage).flatMap(EmailVideoImage.bestSrcFor)
        case _ => None
      }
    imageUrl(contentCard.displayElement)
  }

  def subjectFromPage(page: Page): String =
    page match {
      case c: ContentPage => c.item.trail.headline
      case p: PressedPage => p.metadata.description.getOrElse(p.metadata.webTitle)
    }

  def introFromPage(page: Page): Option[String] =
    page match {
      case c: ContentPage => c.item.trail.byline
      case p: PressedPage => p.frontProperties.onPageDescription
    }

  def classesForCard(card: ContentCard, withImage: Boolean = false): Seq[String] = {
    Seq(toneClassFromStyle(card.cardStyle)) ++
      (if (withImage) Seq("fc--large") else Nil) ++
      (if (card.branding.exists(_.isPaid)) Seq("tone-branded") else Nil) ++
      card.pillar.map(pillar => Seq(s"pillar-${pillar.name}")).getOrElse(Nil)
  }

  def icon(name: String, largeHeadline: Boolean = false, className: String = ""): Html =
    Html {
      val height = if (largeHeadline) 18 else 12
      s"""<img height="$height" src="${Static(s"images/email/icons/$name.png")}" class="icon $className icon-$name">"""
    }

  private def img(width: Int)(src: String, alt: Option[String] = None) =
    Html {
      s"""<img width="$width" class="full-width" src="$src" ${alt.map(alt => s"""alt="$alt"""").getOrElse("")}>"""
    }

  def imgForArticle: (String, Option[String]) => Html = img(EmailImage.knownWidth) _
  def imgForVideo: (String, Option[String]) => Html = img(EmailVideoImage.knownWidth) _

  def imgForFront: (String, Option[String]) => Html = img(width = EmailImageParams.fullWidth) _

  def imgFromCard(card: ContentCard, colWidth: Int = 12, altTextOverride: Option[String] = None)(implicit
      requestHeader: RequestHeader,
  ): Option[Html] = {
    val width = ((colWidth.toDouble / 12.toDouble) * EmailImageParams.fullWidth).toInt
    imageUrlFromCard(card, width).map { url =>
      Html {
        val urlMatcher = raw"^(https?|/).*".r

        card.header.url match {
          case EditionalisedLink(urlMatcher(baseUrl)) => {
            s"""<a ${card.header.url.hrefWithRel}>${img(width)(
                url,
                Some(altTextOverride.getOrElse(card.header.headline)),
              )}</a>"""
          }
          case _ => {
            s"""${img(width)(url, Some(altTextOverride.getOrElse(card.header.headline)))}"""
          }
        }
      }
    }
  }

  object Images {
    val footerG = Static("images/email/grey-g.png")
    val quote = Static("images/email/quote.png")
    val play = Static("images/email/icons/play.png")
  }
}

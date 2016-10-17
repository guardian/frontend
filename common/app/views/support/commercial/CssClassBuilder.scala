package views.support.commercial

import common.commercial.CardContent

object CssClassBuilder {

  private def cardLink(cardContent: CardContent,
                       adClasses: Option[Seq[String]],
                       sizeClass: Option[String],
                       useCardBranding: Boolean): String = {
    val classes: Seq[String] = Seq(
      "advert",
      sizeClass getOrElse "",
      "advert--capi",
      cardContent.icon map (_ => "advert--media") getOrElse "advert--text",
      adClasses.map(_.map(c => s"advert--$c").mkString(" ")).getOrElse(""),
      if (useCardBranding) "advert--branded" else ""
    )
    classes mkString " "
  }

  def linkFromStandardCard(cardContent: CardContent,
                       adClasses: Option[Seq[String]],
                       useCardBranding: Boolean): String = {
    cardLink(cardContent, adClasses, sizeClass = None, useCardBranding)
  }

  def linkFromSmallCard(cardContent: CardContent,
                    adClasses: Option[Seq[String]],
                    useCardBranding: Boolean): String = {
    cardLink(cardContent, adClasses, sizeClass = Some("advert--small"), useCardBranding)
  }

  def linkFromLargeCard(cardContent: CardContent,
                    adClasses: Option[Seq[String]],
                    useCardBranding: Boolean): String = {
    cardLink(cardContent, adClasses, sizeClass = Some("advert--large"), useCardBranding)
  }

  def advertContainer(otherClasses: Option[Seq[String]]): String =
    "advert-container " + otherClasses.map(_.mkString(" ")).getOrElse("")
}

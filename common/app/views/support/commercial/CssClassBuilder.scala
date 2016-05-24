package views.support.commercial

import common.commercial.CardContent

object CssClassBuilder {

  def cardLink(cardContent: CardContent,
               adClasses: Option[Seq[String]],
               otherClasses: Option[Seq[String]],
               brandedCard: Boolean): String = {
    val classes: Seq[String] = Seq(
      "advert",
      "advert--capi",
      cardContent.icon map (_ => "advert--media") getOrElse "advert--text",
      adClasses.map(_.map(c => s"advert--$c").mkString(" ")).getOrElse(""),
      otherClasses.map(_.mkString(" ")).getOrElse(""),
      if (brandedCard) "js-sponsored-card" else ""
    )
    classes mkString " "
  }
}

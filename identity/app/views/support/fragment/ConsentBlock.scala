package views.support.fragment

import play.twirl.api.Html

object ConsentBlock {

  sealed abstract class ConsentBlock(
      val show: Boolean,
      val name: String,
  ) {}

  sealed abstract class ConsentBlockWithHelp(
      show: Boolean,
      name: String,
      help: List[ConsentStepHelpTextTrait] = List(),
  ) extends ConsentBlock(show, name)

  sealed trait ConsentStepHelpTextTrait

  case class ConsentStepHelpLegalText(text: String) extends ConsentStepHelpTextTrait
  case class ConsentStepHelpText(text: String) extends ConsentStepHelpTextTrait

  case class ConsentBanner(
      title: String,
  ) extends ConsentBlock(show = true, name = title)

  case class ConsentCustomHtml(
      title: String,
      content: Html = Html(""),
  ) extends ConsentBlock(show = true, name = title)

  case class ConsentStep(
      override val name: String,
      title: String,
      help: List[ConsentStepHelpTextTrait] = List(),
      content: Html = Html(""),
      extraClassNames: List[String] = Nil,
      override val show: Boolean = true,
  ) extends ConsentBlockWithHelp(show, name, help)

  def renderBlocks(steps: List[ConsentBlock]): List[Html] = {
    val displaySteps = steps.filter(_.show)
    val firstHelpableBlock = steps
      .filter(_ match {
        case _: ConsentBlockWithHelp => true
        case _                       => false
      })
      .head
    displaySteps.zipWithIndex.map {
      case (block, index) =>
        views.html.consentJourneyFragments.block(block, block == firstHelpableBlock, index == (displaySteps.size - 1))
    }
  }

}

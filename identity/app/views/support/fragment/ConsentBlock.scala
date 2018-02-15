package views.support.fragment

import play.twirl.api.Html

object ConsentBlock {

  sealed abstract class ConsentBlock(
    val show: Boolean,
    val name: String
  ) {}

  sealed trait ConsentStepHelpTextTrait

  case class ConsentStepHelpLegalText(text: String) extends ConsentStepHelpTextTrait

  case class ConsentStepHelpText(text: String) extends ConsentStepHelpTextTrait


  case class ConsentBanner(
    title: String
  ) extends ConsentBlock(show=true, name=title)

  case class ConsentInfo(
    title: String,
    help: List[ConsentStepHelpTextTrait] = Nil,
  ) extends ConsentBlock(show=true, name=title)

  case class ConsentStep(
    override val name: String,
    title: String,
    help: List[ConsentStepHelpTextTrait] = Nil,
    content: Html = Html(""),
    override val show: Boolean = true
  ) extends ConsentBlock(show, name)


  def renderBlocks(steps:List[ConsentBlock]): List[Html] = {
    val displaySteps = steps.filter(_.show)
    displaySteps.zipWithIndex.map{ case (block, index) =>
      views.html.consentJourneyFragments.block(block, index == 0, index == (displaySteps.size - 1))
    }
  }

}

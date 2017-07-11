package conf.switches

import org.joda.time.LocalDate

trait JournalismSwitches {
  // Facia

  val StoryQuizzes = Switch(
    SwitchGroup.Journalism,
    "story-quizzes",
    "If this switch is on, quiz atoms will be split parsed for story quizzes",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = On,
    sellByDate = new LocalDate(2017, 8, 11),
    exposeClientSide = false
  )

}

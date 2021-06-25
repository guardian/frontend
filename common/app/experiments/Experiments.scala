package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = new LocalDate(2021, 11, 30),
      participationGroup = Perc0A,
    )

object InteractiveLibrarian
    extends Experiment(
      name = "interactive-librarian",
      description = "Private experiment to develop archiving backup for Interactives",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = new LocalDate(2021, 8, 31),
      participationGroup = Perc0B,
    )

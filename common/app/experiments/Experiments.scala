package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    InteractiveLibrarianExp,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2021, 11, 30),
      participationGroup = Perc0A,
    )

object InteractiveLibrarianExp
    extends Experiment(
      name = "interactive-librarian",
      description = "Private experiment to develop archiving backup for Interactives",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2021, 8, 31),
      participationGroup = Perc0B,
    )

object TopAboveNavHeight
    extends Experiment(
      name = "top-above-nav-height",
      description = "Set minimum height of top-above-nav ad slot to 250px rather than current height of 90px",
      owners = Seq(Owner.withGithub("zekehuntergreen")),
      sellByDate = LocalDate.of(2021, 8, 31),
      participationGroup = Perc1A,
    )

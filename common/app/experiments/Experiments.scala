package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    LiveblogPinnedBlock,
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

object LiveblogPinnedBlock
    extends Experiment(
      name = "liveblog-pinned-post",
      description = "Pin a post at the top of a liveblog",
      owners = Seq(Owner.withGithub("alinaboghiu")),
      sellByDate = LocalDate.of(2022, 1, 3),
      participationGroup = Perc0C,
    )

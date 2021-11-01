package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

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
      sellByDate = LocalDate.of(2021, 11, 30),
      participationGroup = Perc0A,
    )

object LiveblogFiltering
    extends Experiment(
      name = "liveblog-filtering",
      description = "Filter liveblogs by key events",
      owners = Seq(Owner.withGithub("alinaboghiu")),
      sellByDate = LocalDate.of(2021, 12, 1),
      participationGroup = Perc0B,
    )

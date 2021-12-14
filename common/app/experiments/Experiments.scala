package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    LiveblogPinnedBlock,
    FetchNonRefreshableLineItems,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2022, 6, 2),
      participationGroup = Perc10A,
    )

object LiveblogPinnedBlock
    extends Experiment(
      name = "liveblog-pinned-post",
      description = "Pin a post at the top of a liveblog",
      owners = Seq(Owner.withGithub("alinaboghiu")),
      sellByDate = LocalDate.of(2022, 1, 3),
      participationGroup = Perc0C,
    )

object FetchNonRefreshableLineItems
    extends Experiment(
      name = "fetch-non-refreshable-line-items",
      description = "Fetch non-refreshable line items via a new endpoint",
      owners = Seq(Owner.withGithub("chrislomaxjones")),
      sellByDate = LocalDate.of(2022, 1, 24),
      participationGroup = Perc1A,
    )

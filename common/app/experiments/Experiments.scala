package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(Inline1ContainerSizing)

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object FrontRendering
    extends Experiment(
      name = "front-rendering",
      description = "Use DCR for fronts",
      owners = Seq(Owner.withGithub("dotcom")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc0A,
    )

object Inline1ContainerSizing
    extends Experiment(
      name = "inline1-container-sizing",
      description = "Tests the impact on CLS of fixing the inline1 ad container to full width",
      owners = Seq(Owner.withGithub("arelra")),
      sellByDate = LocalDate.of(2022, 5, 24),
      participationGroup = Perc20A,
    )

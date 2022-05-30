package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(InteractivesIdleLoading)

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

object InteractivesIdleLoading
    extends Experiment(
      name = "interactives-idle-loading",
      description =
        "Tests the impact of loading interactive embeds on page idle instead of when they become visible in the viewport",
      owners = Seq(Owner.withGithub("simonbyford")),
      sellByDate = LocalDate.of(2022, 7, 1),
      participationGroup = Perc10A,
    )

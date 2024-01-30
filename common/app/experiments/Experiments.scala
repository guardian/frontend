package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._

import java.time.LocalDate

/*
 * This list of active experiments is sorted by participation group.
 */
object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      AdaptiveSite,
      DeeplyRead,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object DeeplyRead
    extends Experiment(
      name = "deeply-read",
      description = "When ON, deeply read footer section is displayed",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 1, 31),
      participationGroup = Perc50,
    )

// Removing while we are still implementing this content type in DCR
//object DCRImageContent
//    extends Experiment(
//      name = "dcr-image-content",
//      description = "Use DCR for image content",
//      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
//      sellByDate = LocalDate.of(2024, 1, 1),
//      participationGroup = Perc0E,
//    )

object AdaptiveSite
    extends Experiment(
      name = "adaptive-site",
      description = "Enables serving an adaptive version of the site that responds to page performance",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 2),
      participationGroup = Perc1A,
    )

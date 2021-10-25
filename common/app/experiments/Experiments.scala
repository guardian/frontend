package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    StandaloneCommercialBundle,
    StandaloneCommercialBundleTracking,
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

object StandaloneCommercialBundle
    extends Experiment(
      name = "standalone-commercial-bundle",
      description = "Serve a standalone commercial bundle to a subset of users",
      owners = Seq(Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2021, 11, 1),
      participationGroup = Perc50,
    )

object StandaloneCommercialBundleTracking
    extends Experiment(
      name = "standalone-commercial-bundle-tracking",
      description = "Track performance metrics for the standalone commercial bundle",
      owners = Seq(Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2021, 11, 1),
      participationGroup = Perc1A,
    )

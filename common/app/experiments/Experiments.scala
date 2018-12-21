package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    OrielParticipation,
    OldTLSSupportDeprecation,
    PodcastImage
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object OrielParticipation extends Experiment(
  name = "oriel-participation",
  description = "A slice of the audience who will participate in Oriel ad-blocking technology",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2019, 1, 9),
  participationGroup = Perc20A
)

object OldTLSSupportDeprecation extends Experiment(
  name = "old-tls-support-deprecation",
  description = "This will turn on a deprecation notice to any user who is accessing our site using TLS v1.0 or v1.1",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2019, 1,15),
  // Custom group based on header set in Fastly
  participationGroup = TLSSupport
)

object PodcastImage extends Experiment(
  name = "podcast-image",
  description = "For the Fronts container for the Today in Focus podcast, show either the logo or a unique story photo",
  owners = Owner.group(SwitchGroup.Journalism),
  sellByDate = new LocalDate(2019, 1, 9),
  participationGroup = Perc50
)


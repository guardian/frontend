package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(OfferHttp3, KeyEventsCarousel)

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

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2022, 12, 6),
      participationGroup = Perc0B,
    )

object KeyEventsCarousel
    extends Experiment(
      name = "key-events-carousel",
      description = "When ON, live blog key events are displayed in a carousel",
      owners = Seq(Owner.withGithub("abeddow91")),
      sellByDate = LocalDate.of(2022, 9, 13),
      participationGroup = Perc0C,
    )

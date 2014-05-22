import conf.Filters
import feed.OnwardJourneyLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with CommercialLifecycle with OnwardJourneyLifecycle

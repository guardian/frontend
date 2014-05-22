import conf.Filters
import feed.OnwardJourneyLifecycle
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Filters.common: _*) with CommercialLifecycle
                                                      with OnwardJourneyLifecycle
                                                      with ConfigAgentLifecycle

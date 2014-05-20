
import conf.Filters
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)

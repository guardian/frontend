package filters

import javax.inject.Inject

import play.api.http.HttpFilters
import play.filters.csrf.CSRFFilter

class Filters @Inject() (csrfFilter: CSRFFilter) extends HttpFilters {
  def filters = Seq(csrfFilter)
}

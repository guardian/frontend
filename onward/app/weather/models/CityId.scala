package weather.models

import common.{ExecutionContexts, Edition}
import common.editions.{Au, Us, Uk}

case class City(name: String) extends AnyVal

case class CityId(id: String) extends AnyVal

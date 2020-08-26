package business

import play.api.libs.json.Json

/** Basic deserialization for the data exactly as it's given to us by Fingerpost.
  *
  * Further operations will need to be done on this data to get useful types.
  */

object IndexChange {
  implicit val jsonReads = Json.reads[IndexChange]
}

case class IndexChange(
    day: String,
    pctday: String,
    trendday: String,
)

object IndexValue {
  implicit val jsonReads = Json.reads[IndexValue]
}

case class IndexValue(
    localtime: String,
    price: String,
    currency: String,
    change: IndexChange,
    yearhighvalue: String,
    yearhighdate: String,
    yearlowvalue: String,
    yearlowdate: String,
)

object Index {
  implicit val jsonReads = Json.reads[Index]
}

case class Index(
    description: String,
    name: String,
    ticker: String,
    source: String,
    snapshottime: String,
    marketclosed: String,
    value: IndexValue,
)

object Indices {
  implicit val jsonReads = Json.reads[Indices]
}

case class Indices(
    indices: Seq[Index],
)

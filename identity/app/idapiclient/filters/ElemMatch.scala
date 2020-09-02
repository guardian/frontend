package client.filters

case class ElemMatchFilter(path: String, value: String)

case class ElemMatch(arrayPath: String, filters: Iterable[ElemMatchFilter]) extends ApiFilter {
  require(filters.size > 0, "You must provide at least one ElemMatchFilter to an ElemMatch instance")

  override def parameters: Iterable[(String, String)] = {
    Iterable(("elemMatch", arrayPath)) ++ filters.map(filter =>
      ("elemMatchFilter", "%s:%s".format(filter.path, filter.value)),
    )
  }
}

package client.filters

case class ValueFilter(path: String, value: String) extends ApiFilter {
  override def parameters: Iterable[(String, String)] = {
    List(("filter", "%s:%s".format(path, value)))
  }
}

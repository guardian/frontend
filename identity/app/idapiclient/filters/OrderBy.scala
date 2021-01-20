package client.filters

case class OrderBy(orderBy: String, order: Int = -1) extends ApiFilter {
  override def parameters: Iterable[(String, String)] = {
    List(
      ("orderBy", orderBy),
      ("order", order.toString),
    )
  }
}

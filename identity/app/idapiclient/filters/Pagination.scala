package client.filters

case class Pagination(page: Int, pageSize: Int = 20) extends ApiFilter {
  override def parameters: Iterable[(String, String)] = {
    List(
      ("page", page.toString),
      ("pageSize", pageSize.toString),
    )
  }
}

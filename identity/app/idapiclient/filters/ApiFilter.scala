package client.filters

trait ApiFilter {
  def parameters: Iterable[(String, String)]
}

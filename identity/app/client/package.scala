package object client {
  type Response[T] = Either[Error, T]
  type Parameters = Iterable[(String, String)]
}

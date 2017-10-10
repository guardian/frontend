package object idapiclient {
  type Response[T] = Either[List[Error], T]
  type Parameters = Iterable[(String, String)]
}

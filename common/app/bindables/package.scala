package object bindables {
  implicit def crosswordTypeBindable: CrosswordTypeBindable = new CrosswordTypeBindable
  implicit def localDateBindable: LocalDateBindable = new LocalDateBindable
}

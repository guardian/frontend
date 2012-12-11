package implicits

trait AutomaticResourceManagement {
  def withCloseable[T <: { def close() }](closeable: T) = new {
    def apply[S](body: T => S) = try {
      body(closeable)
    } finally {
      closeable.close()
    }
  }

  def withDisposable[T <: { def dispose() }](disposable: T) = new {
    def apply[S](body: T => S) = try {
      body(disposable)
    } finally {
      disposable.dispose()
    }
  }
}
package implicits

import language.reflectiveCalls

trait AutomaticResourceManagement {
  def withCloseable[T <: { def close() }](closeable: T): {
    def apply[S](body: (T) => S): S
  } =
    new {
      def apply[S](body: T => S): S =
        try {
          body(closeable)
        } finally {
          closeable.close()
        }
    }

  def withDisposable[T <: { def dispose() }](disposable: T): {
    def apply[S](body: (T) => S): S
  } =
    new {
      def apply[S](body: T => S): S =
        try {
          body(disposable)
        } finally {
          disposable.dispose()
        }
    }
}

({
  config: {
    math: {
      description: "Math module"
    },
    sum: {
      description: "Sum module"
    }
  },
  shim: {
    nonRequireJsLib: {
      init: function () {
        return this.nonRequireJsLib.noConflict();
      }
    },
    nonRequireJsLib2: {
      init: function () {
        return this.nonRequireJsLib2.noConflict();
      }
    }
  }
})

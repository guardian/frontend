/*global bean:true, buster:true, assert:true*/

buster.testCase('noConflict', {

    'noConflict': function () {
      this.b = bean.noConflict()
      assert(this.b)
      assert.equals(bean(), 'success')
    }

  , 'tearDown': function () {
      window.bean = this.b // reset
    }

})
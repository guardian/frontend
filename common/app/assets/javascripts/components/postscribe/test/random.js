(function() {
  // Random number generation from http://stackoverflow.com/questions/424292/how-to-create-my-own-javascript-random-number-generator-that-i-can-also-set-the
  function nextRandomNumber(){
    var hi = this.seed / this.Q;
    var lo = this.seed % this.Q;
    var test = this.A * lo - this.R * hi;
    if(test > 0){
      this.seed = test;
    } else {
      this.seed = test + this.M;
    }
    return (this.seed * this.oneOverM);
  }

  function RandomNumberGenerator(seed){
    var d = new Date();
    this.seed = seed || 2345678901 + (d.getSeconds() * 0xFFFFFF) + (d.getMinutes() * 0xFFFF);
    this.A = 48271;
    this.M = 2147483647;
    this.Q = this.M / this.A;
    this.R = this.M % this.A;
    this.oneOverM = 1.0 / this.M;
    this.next = nextRandomNumber;
    return this;
  }

  // Fix the seed so we can reproduce the tests.
  var defaultSeed = 3268687866;
  // NBCU YUI webplayer seed: 674743267.9180806;
  // seed = 134065026.19320065;
  var gen = new RandomNumberGenerator(defaultSeed);

  function random() {
    //return gen.next();
    return random.native();
  };

  random.seed = function(seed) {
    if(seed == null) {
      return gen.seed;
    } else {
      gen = new RandomNumberGenerator(seed);
      return random;
    }
  }

  random.reset = function() {
    random.seed(defaultSeed);
    return random;
  };

  random.shuffle = function(arr) {
  	arr = [].slice.call(arr);
   	var len = arr.length;
  	for (var i = 0; i < len; i++) {
  	 	var j = parseInt(random()*len);
  		var temp = arr[i];
    	arr[i] = arr[j];
  	  arr[j] = temp;
   	}
  	return arr;
  };

  this.random = random;
  random.native = Math.random;
  Math.random = random;

})();

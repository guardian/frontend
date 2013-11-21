# Component
## Thinking in bits

### Why?
* Solve problems once
* Work with other architectural decisions at the Guardian
* Get things done quickly

### How?
* Nothing new
* Based (lightly) on [Flight](http://twitter.github.io/flight/) and [Closure Components](https://code.google.com/p/closure-library/wiki/IntroToComponents)
* Simple (more of an interface)
* Using Guardian NextGen’s MicroLibs

### Component lifecycle

![Circle of life](http://memeguy.com/photos/images/circle-of-life-is-bullshit-18243.gif)

    var Lion = function() {}
    component.define(Lion);
    // ...
    var lion = new Lion();

#### Got DOM?

    var elem = document.getElementById('lion');
    lion.attachTo(elem);
    // OR
    lion.attachToDefault();
    
#### Got template?

    <script type="text/template" id="tmpl-lion">...</script>
    <!-- Now in the JavaScript -->
    // ...
    lion.render();

#### Got XHR?

    // ...
    lion.fetch();
  
    
### Events
  
    lion.on('roar', this.getElem('tail'), this.wagTail);
    lion.emit('roar', { volume: 'extreme' });
    

### Just BEM it

    <div class="face">
      <div class="face__eyes"></div>
    </div>

    var eyes = face.getElem('eyes');
    eyes.setState('closed');

    <div class="face">
      <div class="face__eyes face__eyes--closed"></div>
    </div>
    

### TODO

* Data binding: Knockout, Ractive? Real time?
* Templating
* Documentation
* TESTING‽

    
    



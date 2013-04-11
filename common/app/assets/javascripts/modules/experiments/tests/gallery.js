define([], function () {
   
    var ExperimentGallery = function () {
        
        this.id = 'gallery-next';
        this.description = 'adjusts the size of the next/back links on galleries to increase click-throughs';
        this.variants = [
            
            { id: 'control',    test: function () { /*console.log('variant number one');*/ }},
            { id: 'big',        test: function () { /*console.log('variant number two');*/ }},
            { id: 'small',      test: function () { /*console.log('variant number three');*/ }}
        
        ];
    
    };

    return ExperimentGallery;

});


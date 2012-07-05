define([], function(){

    return {
        
        getOperatingSystem: function(){

            if  (navigator.userAgent.match(/iPhone|iPod|iPad/i))
                return 'ios';
            
            if  (navigator.userAgent.match(/Android/i))
                return 'android';

            return false;
        }
    };
});


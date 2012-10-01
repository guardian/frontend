class Related 
    
    include ContentApi

    def initialize
        super
        @params.show_related = 'true'
    end

end

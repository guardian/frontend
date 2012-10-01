class MostPopular
    
    include ContentApi

    def initialize
        super
        @params.show_most_viewed = 'true'
    end

end

class TopStories
    
    include ContentApi

    def initialize
        super
        @params.show_editors_picks = 'true'
    end

end

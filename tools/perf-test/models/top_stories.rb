class TopStories
    
    include ContentApi

    def initialize(opts=nil)
        super
        @params.show_editors_picks = 'true'
        @params.edition = opts[:edition] if opts
    end


end

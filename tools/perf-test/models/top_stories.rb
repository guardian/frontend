class TopStories
    
    include ContentApi

    def initialize(path, opts=nil)
        super
        @params.show_editors_picks = 'true'
        @params.edition = opts[:edition] if opts
    end
    
    def to_www
        "%s/%s/%s?%s" %  ['top-stories', @params.edition, path, 'callback=navigation']
    end

end

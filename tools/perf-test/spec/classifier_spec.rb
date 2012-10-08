
# gallery, video, front, blogs

require 'lib/classifier.rb'

describe Classifier do
        
    it "identify a section url" do
        Classifier.new().whatami('/football').should == "SEC"
    end
    
    it "identify a tag url" do
        Classifier.new().whatami('/football/foo').should == "TAG"
        Classifier.new().whatami('/football/foo/fudge').should == "TAG"
    end
    
    it "identify a article url" do
        Classifier.new().whatami('/sport/2012/jun/12/london-2012-olympic-opening-ceremony').should == "ART"
    end
    
    it "identify a network front url" do
        Classifier.new().whatami('/').should == "FRO"
    end

    it "clean up query strings from URLs" do
        Classifier.new().whatami('/artanddesign/2009/jun/09/rene-magritte-surreal-art-museum?picture=348621940').should == "ART"
    end
    
    it "ignore URLs with a file extension" do
        Classifier.new().whatami('/favicon.png').should == nil
        Classifier.new().whatami('/football/foo.xml').should == nil
        Classifier.new().whatami('/artandderene-magritte-surreal-art-museum.png?picture=asdf').should == nil
    end
    
    it "ignore RSS resources" do
        Classifier.new().whatami('/rss').should == nil
        Classifier.new().whatami('/football/rss').should == nil
        Classifier.new().whatami('/profile/magritte/rss?foo=asdf').should == nil
        Classifier.new().whatami('/profile/arsse').should == 'TAG' # substring 'rss'
    end

    it "ignore gallery, video, discussion applications" do
        Classifier.new().whatami('/discussion').should == nil 
        Classifier.new().whatami('/discussion/foo/foo').should == nil
        Classifier.new().whatami('/artanddesign/gallery/2009/jun/09/rene-magritte-surreal-art-museum?picture=348621940').should == nil 
        Classifier.new().whatami('/football/video/foo').should == nil
    end

end


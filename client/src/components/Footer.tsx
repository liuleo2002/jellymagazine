import { Link } from "wouter";
import { EditableContent } from "@/components/EditableContent";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-jelly-purple via-jelly-pink to-jelly-coral text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-circle text-white text-2xl"></i>
              </div>
              <EditableContent
                section="footer"
                contentKey="title"
                defaultValue="Jelly"
                as="h3"
                className="text-4xl font-bold"
              />
            </div>
            <EditableContent
              section="footer"
              contentKey="description"
              defaultValue="Your colorful companion for creative inspiration, design trends, and joyful content that makes the web a more delightful place."
              as="p"
              className="text-xl text-white/90 mb-6 leading-relaxed max-w-md"
              multiline
            />
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/"><a className="hover:text-jelly-yellow transition-colors">Home</a></Link></li>
              <li><Link href="/archive"><a className="hover:text-jelly-yellow transition-colors">Archive</a></Link></li>
              <li><Link href="/authors"><a className="hover:text-jelly-yellow transition-colors">Authors</a></Link></li>
              <li><Link href="/contact"><a className="hover:text-jelly-yellow transition-colors">Contact</a></Link></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-xl font-bold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-jelly-yellow transition-colors">Design</a></li>
              <li><a href="#" className="hover:text-jelly-yellow transition-colors">Color Theory</a></li>
              <li><a href="#" className="hover:text-jelly-yellow transition-colors">Animation</a></li>
              <li><a href="#" className="hover:text-jelly-yellow transition-colors">Typography</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <EditableContent
            section="footer"
            contentKey="copyright"
            defaultValue="© 2024 Jelly Magazine. Made with 💖 and lots of colorful imagination."
            as="p"
            className="text-white/80"
          />
        </div>
      </div>
    </footer>
  );
}

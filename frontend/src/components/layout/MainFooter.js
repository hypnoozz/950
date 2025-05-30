import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Dumbbell } from 'lucide-react';

const FooterLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-gray-400 hover:text-primary transition-colors duration-150"
  >
    <Icon className="w-6 h-6" />
  </a>
);

const MainFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/70 backdrop-blur-sm border-t border-gray-700/50 text-gray-400 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <Link to="/" className="flex items-center text-xl font-bold text-primary mb-2">
              <Dumbbell className="w-7 h-7 mr-2 text-primary-light" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">GymSys</span>
            </Link>
            <p className="text-sm">
              Elevating your fitness journey with cutting-edge technology and personalized training programs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#courses" className="hover:text-primary transition-colors">Courses</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Schedules</Link></li>
              <li><Link to="#membership" className="hover:text-primary transition-colors">Membership</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <FooterLink href="#" icon={Github} label="GitHub" />
              <FooterLink href="#" icon={Linkedin} label="LinkedIn" />
              <FooterLink href="#" icon={Twitter} label="Twitter" />
              <FooterLink href="mailto:info@gymsys.com" icon={Mail} label="Email" />
            </div>
            <p className="text-sm">info@gymsys.com</p>
            <p className="text-sm">123 Fitness Ave, Tech City</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {currentYear} GymSys. All rights reserved. Powered by Innovation.</p>
          <p className="mt-1">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter; 
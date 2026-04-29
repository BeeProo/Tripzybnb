import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Tripzybnb</h4>
            <p className="footer-desc">
              Discover and book amazing stays around the world. Your perfect getaway is just a click away.
            </p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/search">All Listings</Link>
            <Link to="/search?tags=luxury">Luxury Stays</Link>
            <Link to="/search?tags=budget">Budget Friendly</Link>
            <Link to="/search?tags=beach">Beach Properties</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Cancellation Policy</a>
            <a href="#">Safety</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Tripzybnb. All rights reserved.</p>
          <div className="footer-social">
            <a href="#" title="Twitter">𝕏</a>
            <a href="#" title="Instagram">📷</a>
            <a href="#" title="Facebook">ⓕ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

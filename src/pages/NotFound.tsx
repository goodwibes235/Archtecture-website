/**
 * ATELIER — Custom 404 Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound: React.FC = () => (
  <div className="notfound">
    <div className="notfound__inner">
      <span className="text-label">404</span>
      <h1 className="notfound__headline text-h1">
        Page not found.
      </h1>
      <p className="text-lead notfound__sub">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="notfound__ctas">
        <Link to="/" className="btn btn--primary">Return Home</Link>
        <Link to="/works" className="btn btn--ghost">View Our Work</Link>
      </div>
    </div>
  </div>
);

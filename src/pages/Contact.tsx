/**
 * ATELIER — Project Commission & Inquiries
 * Elevated architectural inquiry portal
 */

import React, { useState } from 'react';
import './Contact.css';

type FormState = 'idle' | 'submitting' | 'success';

export const Contact: React.FC = () => {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTypology, setSelectedTypology] = useState<string>('residential');

  const validate = (form: HTMLFormElement): Record<string, string> => {
    const errs: Record<string, string> = {};
    const d = new FormData(form);
    if (!d.get('name')) errs.name = 'Please enter your name.';
    if (!d.get('email') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.get('email')))) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!d.get('description')) errs.description = 'Please provide a brief outline of your project.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(e.currentTarget);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setState('submitting');
    await new Promise((r) => setTimeout(r, 1000));
    setState('success');
  };

  return (
    <div className="contact-page">
      <div className="contact-hero page-container">
        <span className="hud-badge">
          <span className="hud-badge__dot" />
          Commission Inquiries
        </span>
        <h1 className="text-hero contact-hero__title">
          Initiate an<br /><em>architectural dialogue.</em>
        </h1>
        <p className="text-lead contact-hero__lead">
          We work with discerning clients who value thoughtful, enduring design.
          Share the vision for your project to begin our collaborative process.
        </p>
      </div>

      <div className="contact-body page-container">
        {/* Studio Info Sidebar */}
        <aside className="contact-info">
          <div className="contact-info__card">
            <span className="text-label">Global Presence</span>
            <div className="contact-info__location">
              <h3 className="location-name">Paris Studio</h3>
              <p className="location-details">
                75003 Paris, France<br />
                <span className="text-mono">paris@atelier-spatial.com</span>
              </p>
            </div>
            <div className="contact-info__location">
              <h3 className="location-name">Milan Studio</h3>
              <p className="location-details">
                20121 Milano, Italy<br />
                <span className="text-mono">milano@atelier-spatial.com</span>
              </p>
            </div>
          </div>

          <div className="contact-info__card">
            <span className="text-label">Commission Protocol</span>
            <p className="contact-info__note">
              To preserve exacting architectural fidelity and material depth, our studio
              undertakes a strictly limited portfolio of private and institutional commissions annually.
            </p>
            <div className="contact-info__response text-mono">
              TYPICAL RESPONSE: 48 HOURS
            </div>
          </div>
        </aside>

        {/* Commission Form */}
        <div className="contact-form-container">
          {state === 'success' ? (
            <div className="form-success-card" role="status">
              <span className="hud-badge">
                <span className="hud-badge__dot" />
                Transmission Received
              </span>
              <h2 className="text-h2 form-success__title">
                Thank you for your<br /><em>inquiry.</em>
              </h2>
              <p className="text-lead form-success__desc">
                Your commission brief has been transmitted to our senior partners. We will review
                site requirements and connect with you within two business days.
              </p>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setState('idle')}
              >
                <span>Submit Another Brief</span>
              </button>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Architectural commission form"
            >
              {/* Typology Select Chips */}
              <div className="form-group">
                <label className="form-label">Project Typology</label>
                <div className="typology-chips">
                  {[
                    { id: 'residential', label: 'New Residence' },
                    { id: 'interior', label: 'Interior Architecture' },
                    { id: 'heritage', label: 'Heritage Renovation' },
                    { id: 'hospitality', label: 'Cultural / Hospitality' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`chip-btn ${selectedTypology === t.id ? 'chip-btn--active' : ''}`}
                      onClick={() => setSelectedTypology(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row form-row--2">
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    Principal Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                    placeholder="e.g. Evelyn Vance"
                    autoComplete="name"
                    aria-required="true"
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    Direct Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    placeholder="e.g. evelyn@domain.com"
                    autoComplete="email"
                    aria-required="true"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row form-row--2">
                <div className="form-group">
                  <label htmlFor="contact-location" className="form-label">
                    Site Location
                  </label>
                  <input
                    id="contact-location"
                    name="location"
                    type="text"
                    className="form-input"
                    placeholder="City, Region or Coordinates"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-timeline" className="form-label">
                    Target Groundbreaking
                  </label>
                  <select id="contact-timeline" name="timeline" className="form-input form-select">
                    <option value="6-12mo">Within 6–12 months</option>
                    <option value="1-2yr">1–2 years</option>
                    <option value="concept">Conceptual Planning Phase</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-description" className="form-label">
                  Project Brief &amp; Spatial Vision <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-description"
                  name="description"
                  className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`}
                  rows={5}
                  placeholder="Outline the site topography, desired footprint, architectural intentions, and schedule..."
                  aria-required="true"
                />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>

              <div className="form-submit-row">
                <button
                  type="submit"
                  className="btn btn--primary btn--large"
                  disabled={state === 'submitting'}
                >
                  <span>{state === 'submitting' ? 'Transmitting Brief…' : 'Submit Architectural Brief'}</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


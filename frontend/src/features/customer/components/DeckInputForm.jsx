// =============================================
// Deck Estimator — Deck Input Management Form
// =============================================

import React, { useState } from 'react';
import PhotoUploader from './PhotoUploader';
import ImageGallery from './ImageGallery';

const SHAPE_OPTIONS = [
  { id: 'rectangle', label: 'Rectangle', desc: 'Standard 4-sided rectangular deck' },
  { id: 'square', label: 'Square', desc: 'Equal length and width' },
  { id: 'l_shaped', label: 'L-Shaped', desc: 'Wraps around house corner' },
  { id: 'custom', label: 'Custom / Other', desc: 'Multi-tiered, curved, or irregular shape' },
];

const BUILT_IN_OPTIONS = [
  { id: 'bench', label: 'Built-in Benches' },
  { id: 'pergola', label: 'Pergola / Gazebo' },
  { id: 'planters', label: 'Planter Boxes' },
  { id: 'lighting', label: 'Integrated Post/Step Lighting' },
  { id: 'storage', label: 'Under-deck Storage' },
  { id: 'privacy_screen', label: 'Privacy Wall / Lattice' },
];

const SURFACE_MATERIALS = [
  { id: 'wood', label: 'Natural Wood (Cedar, Redwood, Pressure-Treated Pine)' },
  { id: 'composite', label: 'Composite / PVC (Trex, TimberTech, Fiberon)' },
  { id: 'other', label: 'Other Material' },
  { id: 'unknown', label: "I don't know / Not sure" },
];

const COATING_STATUSES = [
  { id: 'none', label: 'Bare / Unfinished Wood' },
  { id: 'painted', label: 'Solid Painted' },
  { id: 'stained', label: 'Semi-Transparent / Solid Stained' },
  { id: 'sealed', label: 'Clear Sealant / Water Repellent' },
  { id: 'unknown', label: 'Unknown / Not sure' },
];

const CONDITION_OPTIONS = [
  { id: 'peeling_coating', label: 'Peeling / Flaking Coating' },
  { id: 'discoloration', label: 'Discoloration / Graying Wood' },
  { id: 'surface_wear', label: 'Surface Splinters & Wear' },
  { id: 'wood_damage', label: 'Rot or Soft Wood Damage' },
  { id: 'cracks', label: 'Deep Cracks / Warped Planks' },
  { id: 'mold_mildew', label: 'Mold, Mildew, or Algae Growth' },
  { id: 'other', label: 'Other Visible Defects' },
  { id: 'not_sure', label: 'Not Sure / Need Inspection' },
];

const SECTIONS = [
  'Basic Info',
  'Location',
  'Shape & Size',
  'Structure',
  'Surface',
  'Condition',
  'Photographs',
  'Review & Save',
];

export default function DeckInputForm({ initialData = null, onSubmit, onCancel, isSubmitting = false }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    projectName: initialData?.projectName || '',
    projectDescription: initialData?.projectDescription || '',
    propertyAddress: {
      street: initialData?.propertyAddress?.street || '',
      city: initialData?.propertyAddress?.city || '',
      state: initialData?.propertyAddress?.state || '',
      zipCode: initialData?.propertyAddress?.zipCode || '',
      country: initialData?.propertyAddress?.country || 'USA',
    },
    measurementUnit: initialData?.measurementUnit || 'ft',
    deckShape: initialData?.deckShape || 'rectangle',
    dimensions: {
      length: initialData?.dimensions?.length ?? '',
      width: initialData?.dimensions?.width ?? '',
      area: initialData?.dimensions?.area ?? '',
      isManualArea: initialData?.dimensions?.isManualArea || false,
    },
    structureDetails: {
      levels: initialData?.structureDetails?.levels || 1,
      isAttached: initialData?.structureDetails?.isAttached ?? true,
      hasRailings: initialData?.structureDetails?.hasRailings ?? false,
      railingLength: initialData?.structureDetails?.railingLength || '',
      hasStairs: initialData?.structureDetails?.hasStairs ?? false,
      stairStepCount: initialData?.structureDetails?.stairStepCount || '',
      builtInFeatures: initialData?.structureDetails?.builtInFeatures || [],
      structureNotes: initialData?.structureDetails?.structureNotes || '',
    },
    surfaceDetails: {
      material: initialData?.surfaceDetails?.material || 'wood',
      coatingStatus: initialData?.surfaceDetails?.coatingStatus || 'none',
      previousTreatment: initialData?.surfaceDetails?.previousTreatment || '',
      surfaceDescription: initialData?.surfaceDetails?.surfaceDescription || '',
    },
    visibleConditions: initialData?.visibleConditions || [],
    additionalNotes: initialData?.additionalNotes || '',
    completionStatus: initialData?.completionStatus || 'draft',
    images: initialData?.images || [],
  });

  // Dimension input handler with immediate area calculation
  function handleDimensionChange(field, value) {
    setFormData((prev) => {
      const updated = { ...prev.dimensions, [field]: value };
      if (prev.deckShape === 'rectangle' || prev.deckShape === 'square') {
        const len = parseFloat(field === 'length' ? value : updated.length);
        const wid = parseFloat(field === 'width' ? value : updated.width);
        if (!isNaN(len) && len > 0 && !isNaN(wid) && wid > 0) {
          updated.area = Math.round(len * wid * 100) / 100;
          updated.isManualArea = false;
        }
      }
      return { ...prev, dimensions: updated };
    });
  }

  function handleShapeChange(shapeId) {
    setFormData((prev) => {
      const isRectOrSquare = shapeId === 'rectangle' || shapeId === 'square';
      const updatedDimensions = {
        ...prev.dimensions,
        isManualArea: !isRectOrSquare,
      };
      if (isRectOrSquare) {
        const len = parseFloat(updatedDimensions.length);
        const wid = parseFloat(updatedDimensions.width);
        if (!isNaN(len) && len > 0 && !isNaN(wid) && wid > 0) {
          updatedDimensions.area = Math.round(len * wid * 100) / 100;
        }
      }
      return {
        ...prev,
        deckShape: shapeId,
        dimensions: updatedDimensions,
      };
    });
  }

  function toggleBuiltIn(featureId) {
    setFormData((prev) => {
      const exists = prev.structureDetails.builtInFeatures.includes(featureId);
      const updated = exists
        ? prev.structureDetails.builtInFeatures.filter((f) => f !== featureId)
        : [...prev.structureDetails.builtInFeatures, featureId];
      return {
        ...prev,
        structureDetails: { ...prev.structureDetails, builtInFeatures: updated },
      };
    });
  }

  function toggleCondition(conditionId) {
    setFormData((prev) => {
      const exists = prev.visibleConditions.includes(conditionId);
      const updated = exists
        ? prev.visibleConditions.filter((c) => c !== conditionId)
        : [...prev.visibleConditions, conditionId];
      return {
        ...prev,
        visibleConditions: updated,
      };
    });
  }

  function validateCurrentSection() {
    const errors = {};
    if (currentSection === 0) {
      if (!formData.projectName.trim()) {
        errors.projectName = 'Project Name is mandatory.';
      } else if (formData.projectName.trim().length < 2) {
        errors.projectName = 'Project Name must be at least 2 characters.';
      }
    }

    if (currentSection === 2) {
      const isRect = formData.deckShape === 'rectangle' || formData.deckShape === 'square';
      if (isRect) {
        const len = parseFloat(formData.dimensions.length);
        const wid = parseFloat(formData.dimensions.width);
        if (formData.dimensions.length !== '' && (isNaN(len) || len <= 0)) {
          errors.length = 'Length must be a positive number.';
        }
        if (formData.dimensions.width !== '' && (isNaN(wid) || wid <= 0)) {
          errors.width = 'Width must be a positive number.';
        }
      } else {
        const area = parseFloat(formData.dimensions.area);
        if (formData.dimensions.area !== '' && (isNaN(area) || area <= 0)) {
          errors.area = 'Area must be a positive number.';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext() {
    if (validateCurrentSection()) {
      setCurrentSection((prev) => Math.min(prev + 1, SECTIONS.length - 1));
    }
  }

  function handlePrev() {
    setCurrentSection((prev) => Math.max(prev - 1, 0));
  }

  function handleSubmit(status = 'complete') {
    if (!formData.projectName.trim()) {
      setValidationErrors({ projectName: 'Project name is required' });
      setCurrentSection(0);
      return;
    }

    // Sanitize numerical fields
    const payload = {
      ...formData,
      completionStatus: status,
      dimensions: {
        ...formData.dimensions,
        length: formData.dimensions.length ? Number(formData.dimensions.length) : null,
        width: formData.dimensions.width ? Number(formData.dimensions.width) : null,
        area: formData.dimensions.area ? Number(formData.dimensions.area) : null,
      },
      structureDetails: {
        ...formData.structureDetails,
        levels: Number(formData.structureDetails.levels) || 1,
        railingLength: Number(formData.structureDetails.railingLength) || 0,
        stairStepCount: Number(formData.structureDetails.stairStepCount) || 0,
      },
    };

    onSubmit(payload);
  }

  return (
    <div style={styles.card}>
      {/* Step Navigation Bar */}
      <div style={styles.navBar}>
        {SECTIONS.map((sec, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (validateCurrentSection()) setCurrentSection(idx);
            }}
            style={{
              ...styles.navTab,
              borderBottom: currentSection === idx ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: currentSection === idx ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: currentSection === idx ? '600' : '400',
            }}
          >
            {idx + 1}. {sec}
          </button>
        ))}
      </div>

      <div style={styles.formBody}>
        {/* SECTION 1: PROJECT BASIC INFO */}
        {currentSection === 0 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>1. Project Information</h3>
            <p style={styles.sectionDesc}>Give your deck project a clear name and optional description.</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Project Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Backyard Cedar Deck Renovation"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                style={validationErrors.projectName ? styles.inputError : styles.input}
              />
              {validationErrors.projectName && <span style={styles.errorText}>{validationErrors.projectName}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Project Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Describe your goals, any known issues, or details for future contractor bids..."
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                style={styles.textarea}
              />
            </div>
          </div>
        )}

        {/* SECTION 2: PROPERTY LOCATION */}
        {currentSection === 1 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>2. Property Location</h3>
            <p style={styles.sectionDesc}>Location details are used for regional material availability and contractor matching.</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Street Address</label>
              <input
                type="text"
                placeholder="123 Main Street"
                value={formData.propertyAddress.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    propertyAddress: { ...formData.propertyAddress, street: e.target.value },
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  placeholder="Springfield"
                  value={formData.propertyAddress.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyAddress: { ...formData.propertyAddress, city: e.target.value },
                    })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>State / Province</label>
                <input
                  type="text"
                  placeholder="IL"
                  value={formData.propertyAddress.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyAddress: { ...formData.propertyAddress, state: e.target.value },
                    })
                  }
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ZIP / Postal Code</label>
                <input
                  type="text"
                  placeholder="62701"
                  value={formData.propertyAddress.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyAddress: { ...formData.propertyAddress, zipCode: e.target.value },
                    })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <input
                  type="text"
                  value={formData.propertyAddress.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyAddress: { ...formData.propertyAddress, country: e.target.value },
                    })
                  }
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SHAPE & MEASUREMENTS */}
        {currentSection === 2 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>3. Deck Shape & Dimensions</h3>
            <p style={styles.sectionDesc}>Select the deck geometry. For rectangle/square, area is calculated automatically.</p>

            <label style={styles.label}>Deck Shape</label>
            <div style={styles.shapeGrid}>
              {SHAPE_OPTIONS.map((shp) => (
                <div
                  key={shp.id}
                  onClick={() => handleShapeChange(shp.id)}
                  style={{
                    ...styles.shapeCard,
                    borderColor: formData.deckShape === shp.id ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: formData.deckShape === shp.id ? '#eff6ff' : '#fff',
                  }}
                >
                  <div style={styles.shapeName}>{shp.label}</div>
                  <div style={styles.shapeDesc}>{shp.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Measurement Unit</label>
                <div style={styles.radioRow}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="measurementUnit"
                      checked={formData.measurementUnit === 'ft'}
                      onChange={() => setFormData({ ...formData, measurementUnit: 'ft' })}
                    />
                    Feet (sq ft)
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="measurementUnit"
                      checked={formData.measurementUnit === 'm'}
                      onChange={() => setFormData({ ...formData, measurementUnit: 'm' })}
                    />
                    Meters (sq m)
                  </label>
                </div>
              </div>

              {(formData.deckShape === 'rectangle' || formData.deckShape === 'square') ? (
                <div style={styles.grid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Length ({formData.measurementUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      placeholder="e.g. 20"
                      value={formData.dimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      style={validationErrors.length ? styles.inputError : styles.input}
                    />
                    {validationErrors.length && <span style={styles.errorText}>{validationErrors.length}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Width ({formData.measurementUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      placeholder="e.g. 15"
                      value={formData.dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      style={validationErrors.width ? styles.inputError : styles.input}
                    />
                    {validationErrors.width && <span style={styles.errorText}>{validationErrors.width}</span>}
                  </div>
                </div>
              ) : (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Estimated Total Area (sq {formData.measurementUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="e.g. 350"
                    value={formData.dimensions.area}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          area: e.target.value,
                          isManualArea: true,
                        },
                      })
                    }
                    style={validationErrors.area ? styles.inputError : styles.input}
                  />
                  {validationErrors.area && <span style={styles.errorText}>{validationErrors.area}</span>}
                  <small style={styles.fieldHint}>
                    For L-shaped or custom decks, input your estimated square footage. A contractor can assist with exact measurements.
                  </small>
                </div>
              )}

              {formData.dimensions.area && (
                <div style={styles.areaHighlight}>
                  <span style={styles.areaLabel}>Calculated Surface Area:</span>
                  <span style={styles.areaValue}>
                    {formData.dimensions.area} sq {formData.measurementUnit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: STRUCTURE & FEATURES */}
        {currentSection === 3 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>4. Deck Structure & Built-in Features</h3>
            <p style={styles.sectionDesc}>Specify structural levels, railings, stairs, and special built-in items.</p>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Number of Deck Levels</label>
                <select
                  value={formData.structureDetails.levels}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      structureDetails: { ...formData.structureDetails, levels: Number(e.target.value) },
                    })
                  }
                  style={styles.select}
                >
                  <option value={1}>1 Level (Ground / Single Deck)</option>
                  <option value={2}>2 Levels (Multi-tier)</option>
                  <option value={3}>3 Levels</option>
                  <option value={4}>4+ Levels</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Attachment to Home</label>
                <div style={styles.radioRow}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="isAttached"
                      checked={formData.structureDetails.isAttached === true}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          structureDetails: { ...formData.structureDetails, isAttached: true },
                        })
                      }
                    />
                    Attached to House
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="isAttached"
                      checked={formData.structureDetails.isAttached === false}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          structureDetails: { ...formData.structureDetails, isAttached: false },
                        })
                      }
                    />
                    Freestanding / Detached
                  </label>
                </div>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={formData.structureDetails.hasRailings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        structureDetails: { ...formData.structureDetails, hasRailings: e.target.checked },
                      })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  Railing Present
                </label>
                {formData.structureDetails.hasRailings && (
                  <input
                    type="number"
                    placeholder={`Estimated linear ${formData.measurementUnit} of railing (e.g. 40)`}
                    value={formData.structureDetails.railingLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        structureDetails: { ...formData.structureDetails, railingLength: e.target.value },
                      })
                    }
                    style={{ ...styles.input, marginTop: '8px' }}
                  />
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={formData.structureDetails.hasStairs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        structureDetails: { ...formData.structureDetails, hasStairs: e.target.checked },
                      })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  Stairs / Steps Present
                </label>
                {formData.structureDetails.hasStairs && (
                  <input
                    type="number"
                    placeholder="Approximate number of steps (e.g. 4)"
                    value={formData.structureDetails.stairStepCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        structureDetails: { ...formData.structureDetails, stairStepCount: e.target.value },
                      })
                    }
                    style={{ ...styles.input, marginTop: '8px' }}
                  />
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Built-in Features</label>
              <div style={styles.checkboxGrid}>
                {BUILT_IN_OPTIONS.map((feat) => (
                  <label key={feat.id} style={styles.checkboxCard}>
                    <input
                      type="checkbox"
                      checked={formData.structureDetails.builtInFeatures.includes(feat.id)}
                      onChange={() => toggleBuiltIn(feat.id)}
                      style={{ marginRight: '8px' }}
                    />
                    {feat.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Additional Structure Notes</label>
              <input
                type="text"
                placeholder="e.g. Second floor elevation, concrete footings..."
                value={formData.structureDetails.structureNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    structureDetails: { ...formData.structureDetails, structureNotes: e.target.value },
                  })
                }
                style={styles.input}
              />
            </div>
          </div>
        )}

        {/* SECTION 5: SURFACE & MATERIALS */}
        {currentSection === 4 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>5. Surface Material & Coating History</h3>
            <p style={styles.sectionDesc}>Helps recommend proper restoration, preparation, and staining procedures.</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Surface Material</label>
              <select
                value={formData.surfaceDetails.material}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surfaceDetails: { ...formData.surfaceDetails, material: e.target.value },
                  })
                }
                style={styles.select}
              >
                {SURFACE_MATERIALS.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Existing Coating Status</label>
              <select
                value={formData.surfaceDetails.coatingStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surfaceDetails: { ...formData.surfaceDetails, coatingStatus: e.target.value },
                  })
                }
                style={styles.select}
              >
                {COATING_STATUSES.map((coat) => (
                  <option key={coat.id} value={coat.id}>
                    {coat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Previous Treatment Details (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Acrylic latex paint applied 4 years ago"
                value={formData.surfaceDetails.previousTreatment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surfaceDetails: { ...formData.surfaceDetails, previousTreatment: e.target.value },
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Surface Notes / Wood Species</label>
              <textarea
                rows={2}
                placeholder="e.g. Western Red Cedar 2x6 planks, heavy grain raised..."
                value={formData.surfaceDetails.surfaceDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surfaceDetails: { ...formData.surfaceDetails, surfaceDescription: e.target.value },
                  })
                }
                style={styles.textarea}
              />
            </div>
          </div>
        )}

        {/* SECTION 6: VISIBLE CONDITIONS */}
        {currentSection === 5 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>6. Visible Deck Condition</h3>
            <p style={styles.sectionDesc}>
              Select any conditions currently visible on the deck. Multiple selections allowed.
            </p>

            <div style={styles.conditionGrid}>
              {CONDITION_OPTIONS.map((c) => {
                const selected = formData.visibleConditions.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCondition(c.id)}
                    style={{
                      ...styles.conditionCard,
                      borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: selected ? '#eff6ff' : '#fff',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      readOnly
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: selected ? '600' : '400' }}>
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
              <label style={styles.label}>General Project Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Any special access instructions (gate code, pets), timing preferences, or concerns..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                style={styles.textarea}
              />
            </div>
          </div>
        )}

        {/* SECTION 7: PHOTOGRAPHS */}
        {currentSection === 6 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>7. Deck Photographs</h3>
            <p style={styles.sectionDesc}>
              Upload photos of your deck for project documentation.
            </p>

            {initialData?.id ? (
              <>
                <PhotoUploader
                  deckId={initialData.id}
                  existingCount={formData.images?.length || 0}
                  onUploadSuccess={(newImages) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: [...(prev.images || []), ...newImages],
                    }));
                  }}
                />
                <ImageGallery
                  deckId={initialData.id}
                  images={formData.images || []}
                  onDeleteSuccess={(deletedId) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: (prev.images || []).filter((img) => img.id !== deletedId),
                    }));
                  }}
                />
              </>
            ) : (
              <div style={styles.infoNotice}>
                <strong>Note:</strong> You can save your deck project first, and photograph upload will be enabled immediately on your project dashboard. Alternatively, finish entering project details and proceed to Review & Save!
              </div>
            )}
          </div>
        )}

        {/* SECTION 8: REVIEW & SAVE */}
        {currentSection === 7 && (
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>8. Review & Save Deck Project</h3>
            <p style={styles.sectionDesc}>Confirm your information before saving.</p>

            <div style={styles.reviewSummary}>
              <div style={styles.reviewRow}>
                <strong>Project Name:</strong>
                <span>{formData.projectName}</span>
              </div>
              <div style={styles.reviewRow}>
                <strong>Location:</strong>
                <span>
                  {[formData.propertyAddress.city, formData.propertyAddress.state, formData.propertyAddress.zipCode]
                    .filter(Boolean)
                    .join(', ') || 'Not specified'}
                </span>
              </div>
              <div style={styles.reviewRow}>
                <strong>Geometry:</strong>
                <span>
                  {formData.deckShape.toUpperCase()} —{' '}
                  {formData.dimensions.area
                    ? `${formData.dimensions.area} sq ${formData.measurementUnit}`
                    : 'Measurements pending'}
                </span>
              </div>
              <div style={styles.reviewRow}>
                <strong>Structure:</strong>
                <span>
                  {formData.structureDetails.levels} level(s),{' '}
                  {formData.structureDetails.isAttached ? 'Attached' : 'Freestanding'},{' '}
                  {formData.structureDetails.hasRailings ? `Railings (${formData.structureDetails.railingLength || '?'} ft)` : 'No railing'},{' '}
                  {formData.structureDetails.hasStairs ? `Stairs (${formData.structureDetails.stairStepCount || '?'} steps)` : 'No stairs'}
                </span>
              </div>
              <div style={styles.reviewRow}>
                <strong>Surface & Coating:</strong>
                <span>
                  {formData.surfaceDetails.material} ({formData.surfaceDetails.coatingStatus} coating)
                </span>
              </div>
              <div style={styles.reviewRow}>
                <strong>Reported Conditions:</strong>
                <span>
                  {formData.visibleConditions.length > 0
                    ? formData.visibleConditions.join(', ')
                    : 'None reported'}
                </span>
              </div>
              <div style={styles.reviewRow}>
                <strong>Photographs:</strong>
                <span>{formData.images?.length || 0} attached</span>
              </div>
            </div>

            <div style={styles.statusChooser}>
              <label style={styles.label}>Project Status</label>
              <div style={styles.radioRow}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="completionStatus"
                    checked={formData.completionStatus === 'complete'}
                    onChange={() => setFormData({ ...formData, completionStatus: 'complete' })}
                  />
                  Mark as Complete (Ready for estimation)
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="completionStatus"
                    checked={formData.completionStatus === 'draft'}
                    onChange={() => setFormData({ ...formData, completionStatus: 'draft' })}
                  />
                  Save as Draft (Still collecting measurements)
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={styles.footer}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} style={styles.cancelBtn} disabled={isSubmitting}>
              Cancel
            </button>
          )}
          {currentSection > 0 && (
            <button type="button" onClick={handlePrev} style={styles.secondaryBtn} disabled={isSubmitting}>
              ← Back
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            style={styles.draftBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button type="button" onClick={handleNext} style={styles.primaryBtn} disabled={isSubmitting}>
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit('complete')}
              style={styles.saveCompleteBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save & Finalize Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    maxWidth: '900px',
    margin: '0 auto',
  },
  navBar: {
    display: 'flex',
    overflowX: 'auto',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg)',
    padding: '0 8px',
  },
  navTab: {
    padding: '12px 14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  formBody: {
    padding: '28px',
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-text)',
  },
  sectionDesc: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '-8px',
    marginBottom: '8px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    outline: 'none',
  },
  inputError: {
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--color-danger)',
  },
  fieldHint: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
  },
  shapeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  shapeCard: {
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  shapeName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--color-text)',
    marginBottom: '4px',
  },
  shapeDesc: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.4',
  },
  radioRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  areaHighlight: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '12px 18px',
    borderRadius: 'var(--radius)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  areaLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534',
  },
  areaValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#15803d',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '10px',
  },
  checkboxCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  conditionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
  },
  conditionCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  infoNotice: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--color-border)',
    padding: '16px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    color: 'var(--color-text)',
    lineHeight: '1.5',
  },
  reviewSummary: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  reviewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '8px',
  },
  statusChooser: {
    marginTop: '16px',
  },
  footer: {
    borderTop: '1px solid var(--color-border)',
    padding: '16px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  cancelBtn: {
    padding: '9px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--color-text)',
  },
  secondaryBtn: {
    padding: '9px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--color-text)',
  },
  draftBtn: {
    padding: '9px 18px',
    backgroundColor: '#f1f5f9',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  primaryBtn: {
    padding: '9px 22px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  saveCompleteBtn: {
    padding: '9px 24px',
    backgroundColor: 'var(--color-success)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

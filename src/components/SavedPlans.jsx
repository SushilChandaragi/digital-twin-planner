// Import React hooks and navigation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedPlans.css'; // Import component-specific styles

function SavedPlans() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // STATE MANAGEMENT
  const [savedPlans, setSavedPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK DATA - Sample saved plans (replace with actual API calls)
  const mockPlans = [
    {
      id: 1,
      name: "Smart City District A",
      description: "Urban planning layout with smart infrastructure including IoT sensors, green spaces, and efficient transport systems.",
      thumbnail: "/api/placeholder/300/200",
      createdDate: "2024-12-15",
      lastModified: "2024-12-20",
      type: "urban",
      resources: 24,
      size: "2.3 MB",
      status: "completed",
      tags: ["smart-city", "IoT", "sustainable"]
    },
    {
      id: 2,
      name: "Industrial Complex Beta",
      description: "Manufacturing zone with optimized logistics, waste management systems, and energy-efficient facilities.",
      thumbnail: "/api/placeholder/300/200",
      createdDate: "2024-12-10",
      lastModified: "2024-12-18",
      type: "industrial",
      resources: 31,
      size: "4.1 MB",
      status: "in-progress",
      tags: ["manufacturing", "logistics", "efficiency"]
    },
    {
      id: 3,
      name: "Residential Hub Gamma",
      description: "Modern residential area with community centers, parks, schools, and sustainable housing solutions.",
      thumbnail: "/api/placeholder/300/200",
      createdDate: "2024-12-05",
      lastModified: "2024-12-16",
      type: "residential",
      resources: 18,
      size: "1.8 MB",
      status: "completed",
      tags: ["residential", "community", "sustainable"]
    },
    {
      id: 4,
      name: "Commercial Plaza Delta",
      description: "Shopping and business district with integrated parking, public transport, and entertainment venues.",
      thumbnail: "/api/placeholder/300/200",
      createdDate: "2024-11-28",
      lastModified: "2024-12-14",
      type: "commercial",
      resources: 27,
      size: "3.2 MB",
      status: "completed",
      tags: ["commercial", "retail", "entertainment"]
    },
    {
      id: 5,
      name: "Educational Campus Epsilon",
      description: "University campus layout with academic buildings, research facilities, dormitories, and recreational areas.",
      thumbnail: "/api/placeholder/300/200",
      createdDate: "2024-11-20",
      lastModified: "2024-12-12",
      type: "educational",
      resources: 22,
      size: "2.9 MB",
      status: "draft",
      tags: ["education", "research", "campus"]
    },
    {
      id: 6,
      name: "Healthcare District Zeta",
      description: "Medical complex with hospitals, clinics, emergency services, and wellness centers for comprehensive healthcare.",
      thumbnail: "/api/placeholder/300/200",
      createdDate: "2024-11-15",
      lastModified: "2024-12-10",
      type: "healthcare",
      resources: 19,
      size: "2.1 MB",
      status: "completed",
      tags: ["healthcare", "medical", "emergency"]
    }
  ];

  // LOAD SAVED PLANS
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSavedPlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  // FILTER AND SEARCH FUNCTIONALITY
  const filteredPlans = savedPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || plan.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // SORT FUNCTIONALITY
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.lastModified) - new Date(a.lastModified);
      case 'oldest':
        return new Date(a.lastModified) - new Date(b.lastModified);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  // PLAN ACTIONS
  const handleViewPlan = (plan) => {
    navigate(`/plan/${plan.id}`);
  };

  const handleEditPlan = (plan) => {
    navigate(`/plan/${plan.id}/edit`);
  };

  const handleDuplicatePlan = (plan) => {
    const duplicatedPlan = {
      ...plan,
      id: Date.now(),
      name: `${plan.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft'
    };
    setSavedPlans([duplicatedPlan, ...savedPlans]);
  };

  const handleDeletePlan = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setSavedPlans(savedPlans.filter(plan => plan.id !== planToDelete.id));
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const handleExportPlan = (plan) => {
    // Simulate export functionality
    alert(`Exporting ${plan.name}...`);
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // GET STATUS COLOR
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--success-green)';
      case 'in-progress': return 'var(--primary-cyan)';
      case 'draft': return 'var(--warning-yellow)';
      default: return 'var(--text-secondary)';
    }
  };

  // RENDER COMPONENT
  return (
    <div className="saved-plans-page">
      {/* HEADER SECTION */}
      <div className="plans-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="back-button"
            >
              ← Back to Dashboard
            </button>
            <div className="page-title">
              <h1>Saved Plans</h1>
              <p className="page-subtitle">Manage and view your digital twin planning projects</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/plan')}
              className="create-plan-button"
            >
              + Create New Plan
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS AND SEARCH */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search plans by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Filter by Type:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="urban">Urban</option>
              <option value="industrial">Industrial</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="educational">Educational</option>
              <option value="healthcare">Healthcare</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">File Size</option>
            </select>
          </div>
          
          <div className="results-count">
            {sortedPlans.length} plan{sortedPlans.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="plans-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your saved plans...</p>
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No plans found</h3>
            <p>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first digital twin plan to get started'
              }
            </p>
            <button 
              onClick={() => navigate('/plan')}
              className="empty-action-button"
            >
              Create New Plan
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {sortedPlans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-thumbnail">
                  <div className="thumbnail-placeholder">
                    <span className="thumbnail-icon">🏗️</span>
                  </div>
                  <div className="plan-status" style={{ backgroundColor: getStatusColor(plan.status) }}>
                    {plan.status.replace('-', ' ')}
                  </div>
                </div>
                
                <div className="plan-content">
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-type">{plan.type}</div>
                  </div>
                  
                  <p className="plan-description">{plan.description}</p>
                  
                  <div className="plan-tags">
                    {plan.tags.map((tag, index) => (
                      <span key={index} className="plan-tag">#{tag}</span>
                    ))}
                  </div>
                  
                  <div className="plan-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">Resources:</span>
                      <span className="metadata-value">{plan.resources}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Size:</span>
                      <span className="metadata-value">{plan.size}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Modified:</span>
                      <span className="metadata-value">{formatDate(plan.lastModified)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="plan-actions">
                  <button 
                    onClick={() => handleViewPlan(plan)}
                    className="action-button primary"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEditPlan(plan)}
                    className="action-button secondary"
                  >
                    Edit
                  </button>
                  <div className="dropdown-menu">
                    <button className="dropdown-trigger">⋯</button>
                    <div className="dropdown-content">
                      <button onClick={() => handleDuplicatePlan(plan)}>Duplicate</button>
                      <button onClick={() => handleExportPlan(plan)}>Export</button>
                      <button 
                        onClick={() => handleDeletePlan(plan)}
                        className="delete-action"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Plan</h3>
            <p>
              Are you sure you want to delete "{planToDelete?.name}"? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="modal-button secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="modal-button danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedPlans;

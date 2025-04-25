import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/api';
import ProgressShareModal from '../common/ProgressShareModal';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showModules, setShowModules] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseById(courseId);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load course details');
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  //handle video loading when module changes
  useEffect(() => {
    if (!course || !showModules) return;

    const currentModule = course.modules[currentModuleIndex];
    if (!currentModule?.videoLink) return;

    const video = videoRef.current;
    if (!video) return;

    setVideoLoading(true);

    const handleCanPlay = () => {
      console.log('Video can play');
      setVideoLoading(false);
    };

    const handleError = (e) => {
      console.error('Video loading error:', e);
      setVideoLoading(false);
      setError('Failed to load video. Please check the video link.');
    };

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    //set the video source
    video.src = currentModule.videoLink;

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentModuleIndex, course, showModules]);

  const totalModules = course?.modules?.length || 1;
  const progress = Math.round(((currentModuleIndex + 1) / totalModules) * 100);

  const lastMilestoneRef = useRef(null);

  const getMilestone = (progress) => {
    if (progress >= 100) return 100;
    if (progress >= 75) return 75;
    if (progress >= 50) return 50;
    return null;
  };

  useEffect(() => {
    
    const milestone = getMilestone(progress);
  
    if (milestone !== null && lastMilestoneRef.current !== milestone) {
      lastMilestoneRef.current = milestone;
      setShowShareButton(true);
    } else {
      setShowShareButton(false);
    }
  }, [progress]);
  

  

  const handleNext = () => {
    if (currentModuleIndex < course.modules.length - 1) {
      console.log('Moving to next module...');
      console.log('Current index before:', currentModuleIndex);
      setCurrentModuleIndex(prev => {
        const newIndex = prev + 1;
        console.log('New index after:', newIndex);
        return newIndex;
      });
      setShowPdfPreview(false);
      setVideoLoading(true);
      setPdfLoading(true);
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      console.log('Moving to previous module...');
      console.log('Current index before:', currentModuleIndex);
      setCurrentModuleIndex(prev => {
        const newIndex = prev - 1;
        console.log('New index after:', newIndex);
        return newIndex;
      });
      setShowPdfPreview(false);
      setVideoLoading(true);
      setPdfLoading(true);
    }
  };

  const handleShareProgress = () => {
    console.log('Share progress clicked');
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/courses')}>Back to Courses</button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const currentModule = course.modules[currentModuleIndex];

  return (
    <div className="course-detail-container">
      {!showModules ? (
        <div className="course-overview">
          <div className="course-header">
            {course.imageUrl && (
              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="course-banner"
              />
            )}
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-meta">
              <span className="meta-item">Duration: {course.duration} hours</span>
              <span className="meta-item">Level: {course.level}</span>
              <span className="meta-item">Category: {course.category}</span>
            </div>
            <button 
              className="start-course-btn"
              onClick={() => setShowModules(true)}
            >
              Start Course
            </button>
          </div>
        </div>
      ) : (
        <div className="module-view">
          <div className="module-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">
              Progress: {progress}% (Module {currentModuleIndex + 1} of {totalModules})
            </span>
            {showShareButton && (
              <button 
              className={`progress-share-btn ${showShareButton ? 'visible' : ''}`}
              onClick={handleShareProgress}
            >
              Share Progress
            </button>
            
            )}
          </div>

          <div className="module-title">
            <h2>{currentModule.title}</h2>
          </div>

          <div className="module-description">
            <p>{currentModule.description}</p>
          </div>
          
          <div className="module-content">
            {currentModule.videoLink && (
              <div className="video-container">
                {videoLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading video...</p>
                  </div>
                )}
                <video 
                  ref={videoRef}
                  controls
                  className="module-video"
                  poster={course.imageUrl}
                  controlsList="nodownload"
                  preload="auto"
                >
                  <source src={currentModule.videoLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {currentModule.pdfLink && (
              <div className="pdf-section">
                <div className="pdf-header">
                  <h3>Course Materials</h3>
                  <button 
                    className="toggle-pdf-btn"
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                  >
                    {showPdfPreview ? 'Hide PDF' : 'Show PDF'}
                  </button>
                </div>
                {showPdfPreview ? (
                  <div className="pdf-preview-container">
                    {pdfLoading && (
                      <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading PDF...</p>
                      </div>
                    )}
                    <iframe 
                      src={`${currentModule.pdfLink}#toolbar=0`}
                      className="pdf-preview"
                      title="PDF Preview"
                      onLoad={() => setPdfLoading(false)}
                      onError={() => {
                        setPdfLoading(false);
                        setError('Failed to load PDF');
                      }}
                    />
                  </div>
                ) : (
                  <a 
                    href={currentModule.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-link"
                  >
                    <span className="pdf-icon">📄</span>
                    Download PDF Material
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="module-navigation">
            <button 
              className="nav-btn"
              onClick={handlePrevious}
              disabled={currentModuleIndex === 0}
            >
              <span className="nav-icon">←</span>
              Previous Module
            </button>
            <button 
              className="nav-btn primary"
              onClick={handleNext}
              disabled={currentModuleIndex === course.modules.length - 1}
            >
              Next Module
              <span className="nav-icon">→</span>
            </button>
          </div>
        </div>
      )}

      <ProgressShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        course={course}
        progress={getMilestone(progress)}
      />
    </div>
  );
};

export default CourseDetail; 
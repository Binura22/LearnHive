import React, { useEffect, useState } from 'react';
import { getLearningPlanById, updateLearningPlan, getAllCourses } from '../../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import './UpdateLearningPlanForm.css';
import { toast } from 'react-toastify';

const UpdateLearningPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetCompletionDate: '',
    selectedCourses: []
  });

  const [allCourses, setAllCourses] = useState([]);
  const [newCourseId, setNewCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const todayDateString = new Date().toISOString().split('T')[0];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planResponse, coursesResponse] = await Promise.all([
          getLearningPlanById(id),
          getAllCourses()
        ]);

        const plan = planResponse.data;
        const courses = coursesResponse.data;

        setFormData({
          title: plan.title,
          description: plan.description,
          targetCompletionDate: plan.targetCompletionDate ? plan.targetCompletionDate.split('T')[0] : '',
          selectedCourses: plan.selectedCourses || []
        });

        setAllCourses(courses);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCourse = () => {
    if (!newCourseId) return;
    if (formData.selectedCourses.some(course => course.courseId === newCourseId)) {
      alert('Course already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      selectedCourses: [
        ...prev.selectedCourses,
        { courseId: newCourseId, selectedModuleIds: [] }
      ]
    }));
    setNewCourseId('');
  };

  const handleRemoveCourse = (courseIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.filter(course => course.courseId !== courseIdToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedFormData = {
        ...formData,
        targetCompletionDate: formData.targetCompletionDate
          ? `${formData.targetCompletionDate}T00:00:00`
          : null
      };
      await updateLearningPlan(id, updatedFormData);
      toast.success("Successfully updated the plan")
      navigate('/learning-plans');
    } catch (error) {
      console.error('Error updating learning plan', error);
      toast.error("Failed to learning plan")
    }
  };

  if (loading) {
    return <div className="loading">Loading Learning Plan...</div>;
  }

  return (
    <div className="update-learning-plan-form">
      <h2>Update Learning Plan</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Plan Title"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Plan Description"
          required
        />
        <input
          type="date"
          min={todayDateString}
          name="targetCompletionDate"
          value={formData.targetCompletionDate}
          onChange={handleChange}
          required
        />

        <div className="courses-section">
          <h3>Courses</h3>
          <ul className="course-list">
            {formData.selectedCourses.map(course => {
              const courseInfo = allCourses.find(c => c.id === course.courseId);
              return (
                <li key={course.courseId} className="course-item">
                  {courseInfo ? courseInfo.title : 'Unknown Course'}
                  <button
                    type="button"
                    className="remove-course-button"
                    onClick={() => handleRemoveCourse(course.courseId)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="add-course">
            <select
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
            >
              <option value="">Select a Course</option>
              {allCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAddCourse} className="add-course-button">
              Add Course
            </button>
          </div>
        </div>

        <button type="submit" className="update-button">Update Plan</button>
      </form>
    </div>
  );
};

export default UpdateLearningPlanForm;

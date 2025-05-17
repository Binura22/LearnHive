import React, { useState, useEffect } from 'react';
import { createLearningPlan, getPublishedCourses, getAllCourses } from '../../../services/api';
import './LearningPlanForm.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateLearningPlanFromAI } from '../../../services/api';

const LearningPlanForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [courses, setCourses] = useState([]);
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()
  const todayDateString = new Date().toISOString().split('T')[0];
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses', error);
      }
    };

    fetchCourses();
  }, []);



  const handleAIGenerate = async () => {
    if (!goal.trim()) {
      toast.error('Please enter a learning goal.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateLearningPlanFromAI(goal);
      const { title, description, targetCompletionDate, courseTitles } = response.data;

      setTitle(title || '');
      setDescription(description || '');
      setTargetCompletionDate(targetCompletionDate || '');

      // Match courseTitles with actual course IDs
      const matchingIds = courses
        .filter(c => courseTitles?.includes(c.title))
        .map(c => c.id);
      setSelectedCourses(matchingIds || []);

      toast.success('AI-generated plan applied!');
    } catch (error) {
      console.error('AI generation failed', error);
      toast.error('Failed to generate plan with AI.');
    } finally {
      setLoading(false);
    }
  };


  const handleCourseSelect = (courseId) => {
    const updatedSelected = selectedCourses.includes(courseId)
      ? selectedCourses.filter(id => id !== courseId)
      : [...selectedCourses, courseId];
    setSelectedCourses(updatedSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const learningPlanData = {
      userId,
      title,
      description,
      selectedCourses: selectedCourses.map(courseId => ({
        courseId: courseId,
        selectedModuleIds: []
      })),
      targetCompletionDate: targetCompletionDate ? `${targetCompletionDate}T00:00:00` : null,
      progressPercentage: 0
    };

    try {
      await createLearningPlan(learningPlanData);
      toast.success('Learning plan created successfully!');

      setTitle('');
      setDescription('');
      setSelectedCourses([]);
      setTargetCompletionDate('');
      navigate('/learning-plans');
    } catch (error) {
      console.error('Error creating learning plan', error);
      toast.error('Error creating learning plan');
    }
  };

  return (
    <div className="learning-plan-container">
      <h2>Create a Learning Plan</h2>
      <div className="ai-goal-section">
        <label>Enter your learning goal</label>
        <input
          type="text"
          placeholder="e.g. Become a frontend developer"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <button onClick={handleAIGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      <form className="learning-plan-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Target Completion Date</label>
          <input
            type="date"
            min={todayDateString}
            value={targetCompletionDate}
            onChange={(e) => setTargetCompletionDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Courses</label>
          <div className="course-list">
            {courses.map((course) => (
              <label key={course.id} className="course-item">
                <input
                  type="checkbox"
                  value={course.id}
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleCourseSelect(course.id)}
                />
                {course.title}
              </label>
            ))}
          </div>
        </div>

        <button className="submit-btn" type="submit">Create Plan</button>
      </form>
    </div>
  );

};

export default LearningPlanForm;

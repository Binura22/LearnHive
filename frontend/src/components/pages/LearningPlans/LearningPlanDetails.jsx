import React, { useEffect, useState } from 'react';
import { getLearningPlanById, getCourseById } from '../../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import './LearningPlanDetails.css';

const LearningPlanDetails = () => {
    const { id } = useParams();
    const [learningPlan, setLearningPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLearningPlan = async () => {
            try {
                const { data } = await getLearningPlanById(id);
                setLearningPlan(data);

                const courseDetails = await Promise.all(
                    data.selectedCourses?.map(async (course) => {
                        const courseResponse = await getCourseById(course.courseId);
                        return {
                            ...course,
                            title: courseResponse.data.title,
                            link: `/courses/${course.courseId}`,
                        };
                    }) || []
                );

                setCourses(courseDetails);
            } catch (err) {
                console.error('Error fetching learning plan or courses', err);
                setError('Failed to load learning plan. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLearningPlan();
    }, [id]);

    if (loading) {
        return <div className="message loading">Loading Learning Plan...</div>;
    }

    if (error) {
        return <div className="message error">{error}</div>;
    }

    if (!learningPlan) {
        return <div className="message no-plan">Learning Plan not found.</div>;
    }

    return (
        <section className="learning-plan-details">
            <header className="plan-header">
                <h2>{learningPlan.title}</h2>
                <p className="description">{learningPlan.description}</p>
            </header>

            <div className="plan-info">
                <p><strong>Target Completion:</strong> {learningPlan.targetCompletionDate.split('T')[0]}</p>
                <p><strong>Progress:</strong> {learningPlan.progressPercentage}%</p>
            </div>

            <section className="courses-section">
                <h3>Selected Courses</h3>
                {courses.length > 0 ? (
                    <ul className="courses-list">
                        {courses.map((course) => (
                            <li key={course.courseId} className="course-card">
                                <div className="course-header">
                                    <h4>{course.title}</h4>
                                    <button
                                        className="view-course-button"
                                        onClick={() => navigate(course.link)}
                                        aria-label={`View details for ${course.title}`}
                                    >
                                        Start
                                    </button>
                                </div>
                                {/* <p className="modules">
                                    <strong>Modules:</strong> {course.selectedModuleIds?.join(', ') || 'None'}
                                </p> */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-courses">No courses added yet!</p>
                )}
            </section>
        </section>
    );
};

export default LearningPlanDetails;

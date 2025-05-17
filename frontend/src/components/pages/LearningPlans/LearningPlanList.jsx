import React, { useEffect, useState } from 'react';
import { getLearningPlansByUserId, deleteLearningPlan } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LearningPlanList.css';
import {
    DragDropContext,
    Droppable,
    Draggable,
} from '@hello-pangea/dnd';


const LearningPlanList = () => {
    const [learningPlans, setLearningPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reordered = Array.from(learningPlans);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        setLearningPlans(reordered);
    };
    const [searchTerm, setSearchTerm] = useState('');



    useEffect(() => {
        const fetchLearningPlans = async () => {
            try {
                const response = await getLearningPlansByUserId(userId);
                setLearningPlans(response.data);
            } catch (error) {
                console.error('Error fetching learning plans', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLearningPlans();
    }, [userId]);

    const filteredPlans = learningPlans.filter(plan =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleCreatePlan = () => {
        navigate('/create-learning-plan');
    };

    const handleEditPlan = (planId) => {
        navigate(`/learning-plans/${planId}/edit`);
    };

    const handleViewPlan = (planId) => {
        navigate(`/learning-plans/${planId}`);
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm('Are you sure you want to delete this learning plan?')) {
            try {
                await deleteLearningPlan(planId);
                setLearningPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
                toast.success('Learning Plan deleted successfully!')
            } catch (error) {
                console.error('Error deleting learning plan', error);
                toast.error('Failed to delete learning plan.');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading Learning Plans...</div>;
    }

    if (learningPlans.length === 0) {
        return (
            <div className="learning-plan-list">
                <h2>Your Learning Plans</h2>
                <button className="create-button" onClick={handleCreatePlan}>+ Create New Plan</button>
                <div className="no-plans">
                    <div className="empty-box-icon">📦</div>
                    <p>No Learning Plans Found!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="learning-plan-list">
            <div className="list-header">
                <h2>Your Learning Plans</h2>
                <button className="create-button" onClick={handleCreatePlan}>+ Create New Plan</button>
            </div>

            <input
                type="text"
                className="search-input"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />


            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="learningPlans">
                    {(provided) => (
                        <div className="plan-cards" {...provided.droppableProps} ref={provided.innerRef}>
                            {filteredPlans.map((plan, index) => (
                                <Draggable key={plan.id} draggableId={plan.id.toString()} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            className={`plan-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                transition: snapshot.isDragging ? 'transform 0.2s ease' : 'transform 0.3s ease',
                                                boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                                            }}
                                        >
                                            <h3>{plan.title}</h3>
                                            <p>{plan.description}</p>
                                            <p><strong>Target Completion:</strong> {plan.targetCompletionDate ? plan.targetCompletionDate.split('T')[0] : 'N/A'}</p>
                                            <p><strong>Progress:</strong> {plan.progressPercentage}%</p>
                                            <div className="card-actions">
                                                <button className="view-button" onClick={() => handleViewPlan(plan.id)}>View</button>
                                                <button className="edit-button" onClick={() => handleEditPlan(plan.id)}><FaEdit /></button>
                                                <button className="delete-button" onClick={() => handleDeletePlan(plan.id)}><FaTrash /></button>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: `${plan.progressPercentage || 0}%` }}></div>
                                            </div>
                                            {new Date(plan.targetCompletionDate) - new Date() < 3 * 24 * 60 * 60 * 1000 &&
                                                new Date(plan.targetCompletionDate) > new Date() && (
                                                    <div className="deadline-warning">⚠️ Completion date is near!</div>
                                                )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );

};

export default LearningPlanList;

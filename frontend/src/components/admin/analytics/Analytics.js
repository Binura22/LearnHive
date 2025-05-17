import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import BackButton from '../../common/BackButton';
import {PieChart,Pie,Cell,Tooltip,BarChart,Bar,XAxis,YAxis,ResponsiveContainer,Legend} from 'recharts';
import { getAdminCourses, getAdminLearningPlans } from '../../../services/api';
import './Analytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F', '#F9F871'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [learningPlanAnalytics, setLearningPlanAnalytics] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/admin/analytics')
      .then(response => setAnalytics(response.data))
      .catch(() => setAnalytics({}));

    getAdminCourses()
      .then(response => {
        const courses = response.data;
        const publishedCount = courses.filter(c => c.published).length;
        const unpublishedCount = courses.length - publishedCount;

        const categoryCount = courses.reduce((acc, course) => {
          acc[course.category] = (acc[course.category] || 0) + 1;
          return acc;
        }, {});

        const levelCount = courses.reduce((acc, course) => {
          acc[course.level] = (acc[course.level] || 0) + 1;
          return acc;
        }, {});

        const avgDuration = courses.reduce((sum, course) => sum + (course.duration || 0), 0) / courses.length;

        setCourseAnalytics({
          totalCourses: courses.length,
          publishedCount,
          unpublishedCount,
          categoryCount,
          levelCount,
          avgDuration: Math.round(avgDuration)
        });
      })
      .catch(() => setCourseAnalytics({}));

    getAdminLearningPlans()
      .then(response => {
        const plans = response.data;
        const avgProgress = plans.reduce((sum, plan) => sum + (plan.progressPercentage || 0), 0) / plans.length;

        setLearningPlanAnalytics({
          totalPlans: plans.length,
          avgProgress: Math.round(avgProgress)
        });
      })
      .catch(() => setLearningPlanAnalytics({}));
  }, []);

  if (!analytics || !courseAnalytics || !learningPlanAnalytics) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  const userTypeData = [
    { name: 'Total Users', value: analytics.totalUsers || 0 },
    { name: 'Admin Users', value: analytics.adminUsers || 0 },
    { name: 'Normal Users', value: analytics.normalUsers || 0 },
  ];

  const providerData = Object.entries(analytics.usersByProvider || {}).map(
    ([provider, count]) => ({ name: provider, value: count })
  );

  const courseStatusData = [
    { name: 'Published', value: courseAnalytics.publishedCount || 0 },
    { name: 'Unpublished', value: courseAnalytics.unpublishedCount || 0 },
  ];

  const categoryData = Object.entries(courseAnalytics.categoryCount || {}).map(
    ([category, count]) => ({ name: category, value: count })
  );

  const levelData = Object.entries(courseAnalytics.levelCount || {}).map(
    ([level, count]) => ({ name: level, value: count })
  );

  return (
    <div className="analytics-container">
      <div className="header">
        <BackButton />
        <h1>Analytics Dashboard</h1>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Courses</h3>
          <div className="analytics-value">{courseAnalytics.totalCourses || 0}</div>
        </div>
        <div className="analytics-card">
          <h3>Average Course Duration</h3>
          <div className="analytics-value">{courseAnalytics.avgDuration || 0} hours</div>
        </div>
        <div className="analytics-card">
          <h3>Total Learning Plans</h3>
          <div className="analytics-value">{learningPlanAnalytics.totalPlans || 0}</div>
        </div>
        <div className="analytics-card">
          <h3>Average Plan Progress</h3>
          <div className="analytics-value">{learningPlanAnalytics.avgProgress || 0}%</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* User Types Bar Chart */}
        <div className="chart-section">
          <h2>User Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userTypeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Count">
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users by Provider Pie Chart */}
        <div className="chart-section">
          <h2>Users by Provider</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={providerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {providerData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Course Status Pie Chart */}
        <div className="chart-section">
          <h2>Course Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {courseStatusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Courses by Category Bar Chart */}
        <div className="chart-section">
          <h2>Courses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Courses">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Courses by Level Bar Chart */}
        <div className="chart-section">
          <h2>Courses by Level</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Courses">
                {levelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
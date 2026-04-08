/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Button, Typography, Avatar, Space, Tag, Rate, Input, Select,
  Row, Col, Divider, Progress, message,
} from 'antd';
import {
  ArrowLeft, Save, Send, Star, Target, MessageSquare,
  TrendingUp, Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface GoalAssessment {
  key: string;
  title: string;
  category: string;
  weightage: number;
  selfRating: number;
  managerRating: number;
  selfComments: string;
  managerComments: string;
  progress: number;
}

const goalAssessments: GoalAssessment[] = [
  { key: '1', title: 'Complete AWS Solutions Architect Certification', category: 'Technical', weightage: 25, selfRating: 4, managerRating: 4, selfComments: 'Completed 3 out of 4 modules. Exam scheduled for next month.', managerComments: 'Good progress. Need to ensure timely completion.', progress: 75 },
  { key: '2', title: 'Mentor 2 junior developers', category: 'Leadership', weightage: 20, selfRating: 5, managerRating: 4, selfComments: 'Actively mentoring Rohit and Neha. Both have shown significant improvement.', managerComments: 'Excellent mentoring skills observed. Team feedback is positive.', progress: 90 },
  { key: '3', title: 'Reduce API response time by 30%', category: 'Technical', weightage: 30, selfRating: 4, managerRating: 5, selfComments: 'Implemented caching and query optimization. Achieved 35% improvement.', managerComments: 'Outstanding work. Exceeded the target significantly.', progress: 100 },
  { key: '4', title: 'Deliver customer portal v2.0', category: 'Business', weightage: 15, selfRating: 3, managerRating: 3, selfComments: 'Project is on track with minor delays due to requirement changes.', managerComments: 'Acceptable progress given scope changes. Need better stakeholder management.', progress: 60 },
  { key: '5', title: 'Improve code review participation', category: 'Communication', weightage: 10, selfRating: 4, managerRating: 4, selfComments: 'Reviewing 5+ PRs per week consistently.', managerComments: 'Consistent effort. Quality of reviews has improved.', progress: 85 },
];

const ratingLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Unsatisfactory', color: '#ef4444' },
  2: { label: 'Needs Improvement', color: '#f97316' },
  3: { label: 'Meets Expectations', color: '#eab308' },
  4: { label: 'Exceeds Expectations', color: '#3b82f6' },
  5: { label: 'Outstanding', color: '#22c55e' },
};

const ReviewForm: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState(goalAssessments);
  const [overallRating, setOverallRating] = useState<number>(4);
  const [strengths, setStrengths] = useState<string[]>(['Problem solving', 'Technical expertise', 'Team collaboration']);
  const [improvements, setImprovements] = useState<string[]>(['Time management', 'Documentation']);
  const [employeeComments, setEmployeeComments] = useState('This has been a productive year. I have grown significantly in my technical skills and taken on more leadership responsibilities. I look forward to more challenging projects.');
  const [managerComments, setManagerComments] = useState('Rahul has been a strong contributor this year. His technical skills are excellent and he has shown good initiative in mentoring. He needs to work on project estimation and stakeholder communication.');

  const updateGoalSelfRating = (key: string, value: number) => {
    setGoals(prev => prev.map(g => g.key === key ? { ...g, selfRating: value } : g));
  };

  const updateGoalManagerRating = (key: string, value: number) => {
    setGoals(prev => prev.map(g => g.key === key ? { ...g, managerRating: value } : g));
  };

  const updateGoalSelfComments = (key: string, value: string) => {
    setGoals(prev => prev.map(g => g.key === key ? { ...g, selfComments: value } : g));
  };

  const updateGoalManagerComments = (key: string, value: string) => {
    setGoals(prev => prev.map(g => g.key === key ? { ...g, managerComments: value } : g));
  };

  const weightedAvg = goals.reduce((sum, g) => sum + (g.managerRating * g.weightage / 100), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space align="center">
          <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/performance')} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Performance Review</Title>
            <Text type="secondary">Annual Review - Apr 2025 to Mar 2026</Text>
          </div>
        </Space>
        <Space>
          <Button icon={<Save size={16} />}>Save Draft</Button>
          <Button type="primary" icon={<Send size={16} />} onClick={() => message.success('Review submitted successfully')}>
            Submit Review
          </Button>
        </Space>
      </div>

      {/* Employee Info Header */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Avatar size={72} style={{ backgroundColor: '#1a56db', fontSize: 28 }}>RS</Avatar>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>Rahul Sharma</Title>
            <Text type="secondary">Senior Software Engineer | Engineering Department</Text>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Tag color="blue">Employee ID: EMP-1042</Tag>
                <Tag color="purple">Reviewer: Ananya Reddy</Tag>
                <Tag color="green">Period: Apr 2025 - Mar 2026</Tag>
                <Tag color="gold">Type: Annual</Tag>
              </Space>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Weighted Average</Text>
            <div style={{ fontSize: 32, fontWeight: 700, color: ratingLabels[Math.round(weightedAvg)]?.color || '#6b7280' }}>
              {weightedAvg.toFixed(1)}
            </div>
            <Text style={{ color: ratingLabels[Math.round(weightedAvg)]?.color, fontSize: 12 }}>
              {ratingLabels[Math.round(weightedAvg)]?.label}
            </Text>
          </div>
        </div>
      </Card>

      {/* Goals Assessment */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}
        title={<Space><Target size={18} style={{ color: '#1a56db' }} /><span>Goals Assessment</span></Space>}
      >
        {goals.map((goal, index) => (
          <div key={goal.key}>
            {index > 0 && <Divider />}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <Text strong style={{ fontSize: 15 }}>{goal.title}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue">{goal.category}</Tag>
                    <Tag>Weightage: {goal.weightage}%</Tag>
                  </div>
                </div>
                <Progress
                  type="circle"
                  percent={goal.progress}
                  size={52}
                  strokeColor={goal.progress === 100 ? '#059669' : '#1a56db'}
                />
              </div>
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Self Assessment</Text>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Rating</Text>
                      <br />
                      <Rate value={goal.selfRating} onChange={(v) => updateGoalSelfRating(goal.key, v)} />
                      {goal.selfRating > 0 && (
                        <Tag color={ratingLabels[goal.selfRating]?.color} style={{ marginLeft: 8 }}>
                          {ratingLabels[goal.selfRating]?.label}
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Comments</Text>
                    <Input.TextArea
                      rows={2}
                      value={goal.selfComments}
                      onChange={e => updateGoalSelfComments(goal.key, e.target.value)}
                      placeholder="Self assessment comments"
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: '#f0f5ff', borderRadius: 8, padding: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Manager Assessment</Text>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Rating</Text>
                      <br />
                      <Rate value={goal.managerRating} onChange={(v) => updateGoalManagerRating(goal.key, v)} />
                      {goal.managerRating > 0 && (
                        <Tag color={ratingLabels[goal.managerRating]?.color} style={{ marginLeft: 8 }}>
                          {ratingLabels[goal.managerRating]?.label}
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Comments</Text>
                    <Input.TextArea
                      rows={2}
                      value={goal.managerComments}
                      onChange={e => updateGoalManagerComments(goal.key, e.target.value)}
                      placeholder="Manager assessment comments"
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        ))}
      </Card>

      {/* Strengths & Improvements */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<Space><TrendingUp size={18} style={{ color: '#059669' }} /><span>Strengths</span></Space>}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add strengths"
              value={strengths}
              onChange={setStrengths}
            />
            <div style={{ marginTop: 12 }}>
              {strengths.map(s => (
                <Tag key={s} color="green" style={{ marginBottom: 4 }}>{s}</Tag>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<Space><Award size={18} style={{ color: '#d97706' }} /><span>Areas of Improvement</span></Space>}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add areas of improvement"
              value={improvements}
              onChange={setImprovements}
            />
            <div style={{ marginTop: 12 }}>
              {improvements.map(i => (
                <Tag key={i} color="orange" style={{ marginBottom: 4 }}>{i}</Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Comments */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<Space><MessageSquare size={18} style={{ color: '#1a56db' }} /><span>Employee Comments</span></Space>}
          >
            <Input.TextArea
              rows={5}
              value={employeeComments}
              onChange={e => setEmployeeComments(e.target.value)}
              placeholder="Employee self-assessment comments and reflections"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            title={<Space><MessageSquare size={18} style={{ color: '#7c3aed' }} /><span>Manager Comments</span></Space>}
          >
            <Input.TextArea
              rows={5}
              value={managerComments}
              onChange={e => setManagerComments(e.target.value)}
              placeholder="Manager feedback, recommendations, and action items"
            />
          </Card>
        </Col>
      </Row>

      {/* Overall Rating */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}
        title={<Space><Star size={18} style={{ color: '#eab308' }} /><span>Overall Rating</span></Space>}
      >
        <Row gutter={24} align="middle">
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Select Overall Rating</Text>
              <Rate
                value={overallRating}
                onChange={setOverallRating}
                style={{ fontSize: 32 }}
              />
              {overallRating > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Tag
                    color={ratingLabels[overallRating]?.color}
                    style={{ fontSize: 14, padding: '4px 12px' }}
                  >
                    {ratingLabels[overallRating]?.label}
                  </Tag>
                </div>
              )}
            </div>
          </Col>
          <Col span={16}>
            <div style={{ padding: '0 24px' }}>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">Rating Distribution</Text>
              </div>
              {[5, 4, 3, 2, 1].map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Text style={{ width: 20, textAlign: 'center' }}>{r}</Text>
                  <Star size={14} style={{ color: '#eab308' }} />
                  <Progress
                    percent={goals.filter(g => g.managerRating === r).length / goals.length * 100}
                    showInfo={false}
                    strokeColor={ratingLabels[r]?.color}
                    style={{ flex: 1 }}
                    size="small"
                  />
                  <Text type="secondary" style={{ width: 20, textAlign: 'center', fontSize: 12 }}>
                    {goals.filter(g => g.managerRating === r).length}
                  </Text>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Submit Actions */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={() => navigate('/performance')}>Cancel</Button>
          <Space>
            <Button icon={<Save size={16} />} onClick={() => message.success('Draft saved')}>Save as Draft</Button>
            <Button type="primary" icon={<Send size={16} />} onClick={() => message.success('Review submitted successfully')}>
              Submit Review
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ReviewForm;

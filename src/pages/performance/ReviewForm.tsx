import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Star, Target, MessageSquare,
  TrendingUp, Award,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { getInitials } from '@/lib/formatters';
import { useReview, useSubmitReview, useUpdateReview } from '@/hooks/queries/usePerformance';

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

const initialGoals: GoalAssessment[] = [
  { key: '1', title: 'Complete AWS Solutions Architect Certification', category: 'Technical', weightage: 25, selfRating: 4, managerRating: 4, selfComments: 'Completed 3 out of 4 modules. Exam scheduled for next month.', managerComments: 'Good progress. Need to ensure timely completion.', progress: 75 },
  { key: '2', title: 'Mentor 2 junior developers', category: 'Leadership', weightage: 20, selfRating: 5, managerRating: 4, selfComments: 'Actively mentoring Rohit and Neha. Both have shown significant improvement.', managerComments: 'Excellent mentoring skills observed. Team feedback is positive.', progress: 90 },
  { key: '3', title: 'Reduce API response time by 30%', category: 'Technical', weightage: 30, selfRating: 4, managerRating: 5, selfComments: 'Implemented caching and query optimization. Achieved 35% improvement.', managerComments: 'Outstanding work. Exceeded the target significantly.', progress: 100 },
  { key: '4', title: 'Deliver customer portal v2.0', category: 'Business', weightage: 15, selfRating: 3, managerRating: 3, selfComments: 'Project is on track with minor delays due to requirement changes.', managerComments: 'Acceptable progress given scope changes. Need better stakeholder management.', progress: 60 },
  { key: '5', title: 'Improve code review participation', category: 'Communication', weightage: 10, selfRating: 4, managerRating: 4, selfComments: 'Reviewing 5+ PRs per week consistently.', managerComments: 'Consistent effort. Quality of reviews has improved.', progress: 85 },
];

const ratingLabels: Record<number, { label: string; textClass: string; badgeClass: string }> = {
  1: { label: 'Unsatisfactory', textClass: 'text-red-500', badgeClass: 'bg-red-100 text-red-700' },
  2: { label: 'Needs Improvement', textClass: 'text-orange-500', badgeClass: 'bg-orange-100 text-orange-700' },
  3: { label: 'Meets Expectations', textClass: 'text-yellow-500', badgeClass: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Exceeds Expectations', textClass: 'text-blue-500', badgeClass: 'bg-blue-100 text-blue-700' },
  5: { label: 'Outstanding', textClass: 'text-green-500', badgeClass: 'bg-green-100 text-green-700' },
};

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            size={20}
            className={`transition-colors ${i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

function StarRatingDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

const ReviewForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: reviewResponse, isLoading } = useReview(id || '');
  const submitReviewMutation = useSubmitReview();
  const updateReviewMutation = useUpdateReview();

  const reviewData = reviewResponse?.data;
  const [goals, setGoals] = useState(reviewData?.goals ?? initialGoals);
  const [overallRating, setOverallRating] = useState(reviewData?.overallRating ?? 4);
  const [strengths] = useState(reviewData?.strengths ?? ['Problem solving', 'Technical expertise', 'Team collaboration']);
  const [improvements] = useState(reviewData?.improvements ?? ['Time management', 'Documentation']);
  const [employeeComments, setEmployeeComments] = useState(reviewData?.employeeComments ?? 'This has been a productive year. I have grown significantly in my technical skills and taken on more leadership responsibilities. I look forward to more challenging projects.');
  const [managerComments, setManagerComments] = useState(reviewData?.managerComments ?? 'Rahul has been a strong contributor this year. His technical skills are excellent and he has shown good initiative in mentoring. He needs to work on project estimation and stakeholder communication.');

  const updateGoal = (key: string, field: keyof GoalAssessment, value: string | number) => {
    setGoals(prev => prev.map(g => g.key === key ? { ...g, [field]: value } : g));
  };

  const weightedAvg = goals.reduce((sum, g) => sum + (g.managerRating * g.weightage / 100), 0);
  const roundedAvg = Math.round(weightedAvg);

  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading review...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Performance Review</h1>
            <p className="text-sm text-muted-foreground">Annual Review - Apr 2025 to Mar 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const payload = { goals, overallRating, employeeComments, managerComments, strengths, improvements };
            if (id) {
              updateReviewMutation.mutate({ id, data: payload }, {
                onSuccess: () => toast.success('Draft saved'),
                onError: (err: any) => toast.error(err?.message || 'Failed to save draft'),
              });
            } else {
              toast.success('Draft saved');
            }
          }}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={() => {
            if (id) {
              submitReviewMutation.mutate(id, {
                onSuccess: () => toast.success('Review submitted successfully'),
                onError: (err: any) => toast.error(err?.message || 'Failed to submit review'),
              });
            } else {
              toast.success('Review submitted successfully');
            }
          }}>
            <Send className="mr-2 h-4 w-4" /> Submit Review
          </Button>
        </div>
      </div>

      {/* Employee Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-[72px] w-[72px] text-2xl">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials('Rahul Sharma')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">Rahul Sharma</h2>
                <p className="text-sm text-muted-foreground">Senior Software Engineer | Engineering Department</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">Employee ID: EMP-1042</Badge>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">Reviewer: Ananya Reddy</Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-700">Period: Apr 2025 - Mar 2026</Badge>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Type: Annual</Badge>
                </div>
              </div>
            </div>
            <div className="text-center shrink-0">
              <p className="text-sm text-muted-foreground mb-1">Weighted Average</p>
              <p className={`text-3xl font-bold ${ratingLabels[roundedAvg]?.textClass || 'text-muted-foreground'}`}>
                {weightedAvg.toFixed(1)}
              </p>
              <p className={`text-xs ${ratingLabels[roundedAvg]?.textClass || ''}`}>
                {ratingLabels[roundedAvg]?.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={18} className="text-primary" /> Goals Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          {goals.map(goal => (
            <div key={goal.key} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{goal.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">{goal.category}</Badge>
                    <Badge variant="secondary">Weightage: {goal.weightage}%</Badge>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="relative h-13 w-13">
                    <svg className="h-13 w-13 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                      <circle
                        cx="24" cy="24" r="20" fill="none" strokeWidth="4"
                        strokeDasharray={`${(goal.progress / 100) * 125.6} 125.6`}
                        strokeLinecap="round"
                        className={goal.progress === 100 ? 'text-green-600' : 'text-primary'}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{goal.progress}%</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <p className="font-medium text-sm">Self Assessment</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <StarRatingInput value={goal.selfRating} onChange={(v) => updateGoal(goal.key, 'selfRating', v)} />
                      {goal.selfRating > 0 && (
                        <Badge variant="outline" className={ratingLabels[goal.selfRating]?.badgeClass}>
                          {ratingLabels[goal.selfRating]?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Comments</p>
                    <Textarea
                      rows={2}
                      value={goal.selfComments}
                      onChange={e => updateGoal(goal.key, 'selfComments', e.target.value)}
                      placeholder="Self assessment comments"
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3">
                  <p className="font-medium text-sm">Manager Assessment</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <StarRatingInput value={goal.managerRating} onChange={(v) => updateGoal(goal.key, 'managerRating', v)} />
                      {goal.managerRating > 0 && (
                        <Badge variant="outline" className={ratingLabels[goal.managerRating]?.badgeClass}>
                          {ratingLabels[goal.managerRating]?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Comments</p>
                    <Textarea
                      rows={2}
                      value={goal.managerComments}
                      onChange={e => updateGoal(goal.key, 'managerComments', e.target.value)}
                      placeholder="Manager assessment comments"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={18} className="text-green-600" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strengths.map(s => (
                <Badge key={s} variant="outline" className="bg-green-100 text-green-700">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award size={18} className="text-amber-600" /> Areas of Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {improvements.map(i => (
                <Badge key={i} variant="outline" className="bg-orange-100 text-orange-700">{i}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare size={18} className="text-primary" /> Employee Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={5}
              value={employeeComments}
              onChange={e => setEmployeeComments(e.target.value)}
              placeholder="Employee self-assessment comments and reflections"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare size={18} className="text-violet-600" /> Manager Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={5}
              value={managerComments}
              onChange={e => setManagerComments(e.target.value)}
              placeholder="Manager feedback, recommendations, and action items"
            />
          </CardContent>
        </Card>
      </div>

      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={18} className="text-yellow-500" /> Overall Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Rating Selector */}
            <div className="text-center shrink-0 md:w-1/3">
              <p className="text-sm text-muted-foreground mb-2">Select Overall Rating</p>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setOverallRating(i)} className="focus:outline-none">
                    <Star
                      size={32}
                      className={`transition-colors ${i <= overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                    />
                  </button>
                ))}
              </div>
              {overallRating > 0 && (
                <Badge variant="outline" className={`mt-2 text-sm px-3 ${ratingLabels[overallRating]?.badgeClass}`}>
                  {ratingLabels[overallRating]?.label}
                </Badge>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 md:pl-6 md:border-l">
              <p className="text-sm text-muted-foreground mb-3">Rating Distribution</p>
              {[5, 4, 3, 2, 1].map(r => {
                const count = goals.filter(g => g.managerRating === r).length;
                const pct = (count / goals.length) * 100;
                return (
                  <div key={r} className="flex items-center gap-3 mb-2">
                    <span className="w-4 text-center text-sm">{r}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="w-4 text-center text-xs text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/performance')}>Cancel</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
              const payload = { goals, overallRating, employeeComments, managerComments, strengths, improvements };
              if (id) {
                updateReviewMutation.mutate({ id, data: payload }, {
                  onSuccess: () => toast.success('Draft saved'),
                  onError: (err: any) => toast.error(err?.message || 'Failed to save draft'),
                });
              } else {
                toast.success('Draft saved');
              }
            }}>
              <Save className="mr-2 h-4 w-4" /> Save as Draft
            </Button>
            <Button onClick={() => {
              if (id) {
                submitReviewMutation.mutate(id, {
                  onSuccess: () => toast.success('Review submitted successfully'),
                  onError: (err: any) => toast.error(err?.message || 'Failed to submit review'),
                });
              } else {
                toast.success('Review submitted successfully');
              }
            }}>
              <Send className="mr-2 h-4 w-4" /> Submit Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewForm;

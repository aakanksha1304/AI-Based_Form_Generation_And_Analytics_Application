import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Filter, Search, Calendar, User, Mail } from 'lucide-react';
import { getFormById, getFormSubmissions } from '../utils/formApi';
import Navigation from './Navigation';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const FormResponsesView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form details
        const formResponse = await getFormById(formId);
        if (formResponse.response) {
          setForm(formResponse.form);
        }

        // Fetch form submissions
        const submissionsResponse = await getFormSubmissions(formId, { limit: 100 });
        if (submissionsResponse.response) {
          setSubmissions(submissionsResponse.submissions);
        }
      } catch (error) {
        console.error('Error fetching form responses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchData();
    }
  }, [formId]);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.submitterInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.responses.some(response => 
        response.answer?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      const submissionDate = new Date(submission.submittedAt);
      const now = new Date();
      const daysDiff = (now - submissionDate) / (1000 * 60 * 60 * 24);

      switch (dateFilter) {
        case 'today': return daysDiff < 1;
        case 'week': return daysDiff < 7;
        case 'month': return daysDiff < 30;
        default: return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    if (!form || !filteredSubmissions.length) return;

    // Create CSV headers
    const headers = [
      'Submission ID',
      'Submitted At',
      'Submitter Email',
      'Status',
      'Time Spent (seconds)',
      'Device Type',
      ...form.questions.map(q => q.question)
    ];

    // Create CSV rows
    const rows = filteredSubmissions.map(submission => {
      const baseData = [
        submission._id,
        new Date(submission.submittedAt).toLocaleString(),
        submission.submitterInfo?.email || 'Anonymous',
        submission.status,
        submission.metadata?.timeSpent || 'N/A',
        submission.metadata?.deviceType || 'N/A'
      ];

      // Add response data for each question
      const responseData = form.questions.map(question => {
        const response = submission.responses.find(r => r.questionId === question.id);
        if (!response) return '';
        
        // Handle array responses (checkboxes)
        if (Array.isArray(response.answer)) {
          return response.answer.join(', ');
        }
        
        return response.answer || '';
      });

      return [...baseData, ...responseData];
    });

    // Convert to CSV format
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title}_responses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getResponseValue = (submission, questionId) => {
    const response = submission.responses.find(r => r.questionId === questionId);
    if (!response) return '-';
    
    if (Array.isArray(response.answer)) {
      return response.answer.join(', ');
    }
    
    return response.answer || '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-background flex items-center justify-center">
        <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-main-foreground/20 border-t-main-foreground rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-main-foreground font-base">Loading form responses...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-secondary-background flex items-center justify-center">
        <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-heading text-main-foreground mb-4">Form not found</h2>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="default"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-background">
      {/* Navigation */}
      <Navigation />
      
      <div className="pt-20 min-h-screen">
        {/* Header with Filters */}
        <div className="bg-main border-b-2 border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Row - Title and Actions */}
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="neutral"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-heading text-main-foreground">{form.title}</h1>
                  <p className="text-sm text-main-foreground/70 font-base">
                    {filteredSubmissions.length} responses • Created {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={exportToCSV}
                  disabled={!filteredSubmissions.length}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 border-green-700"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Bottom Row - Filters */}
            <div className="pb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-main-foreground/60 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary-background border-border"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40 h-10 px-3 py-2 bg-secondary-background text-main-foreground border-2 border-border rounded-base font-base focus:outline-none focus:ring-0 focus:border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="processed">Processed</option>
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40 h-10 px-3 py-2 bg-secondary-background text-main-foreground border-2 border-border rounded-base font-base focus:outline-none focus:ring-0 focus:border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {filteredSubmissions.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption className="text-main-foreground/70 font-base">
                        A list of form responses ({filteredSubmissions.length} total)
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 font-heading">#</TableHead>
                          <TableHead className="font-heading">Submitter</TableHead>
                          <TableHead className="font-heading">Date & Time</TableHead>
                          <TableHead className="font-heading">Status</TableHead>
                          <TableHead className="font-heading">Time Spent</TableHead>
                          {form.questions.map((question, qIndex) => (
                            <TableHead key={question.id} className="min-w-48 font-heading">
                              <div className="flex items-center gap-2">
                                <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-base border-2 border-border font-heading">
                                  Q{qIndex + 1}
                                </span>
                                <span className="truncate" title={question.question}>
                                  {question.question.length > 25 
                                    ? question.question.substring(0, 25) + '...' 
                                    : question.question
                                  }
                                </span>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission, index) => (
                          <TableRow key={submission._id}>
                            <TableCell>
                              <div className="flex items-center justify-center w-8 h-8 bg-main text-main-foreground rounded-base border-2 border-border text-sm font-heading">
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-main rounded-base border-2 border-border flex items-center justify-center">
                                  <User className="w-4 h-4 text-main-foreground" />
                                </div>
                                <div>
                                  <div className="text-sm font-base text-main-foreground">
                                    {submission.submitterInfo?.email || submission.submittedBy || 'Anonymous User'}
                                  </div>
                                  <div className="text-xs text-main-foreground/60 font-base">
                                    {submission.metadata?.deviceType || 'Unknown'} • {submission.metadata?.browser || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm font-base text-main-foreground">
                                  {new Date(submission.submittedAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-main-foreground/60 font-base">
                                  {new Date(submission.submittedAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-base text-xs font-base border-2 border-border ${
                                submission.status === 'new' ? 'bg-chart-1 text-main-foreground' :
                                submission.status === 'reviewed' ? 'bg-chart-3 text-main-foreground' :
                                'bg-chart-4 text-main-foreground'
                              }`}>
                                {submission.status}
                              </span>
                            </TableCell>
                            <TableCell className="font-base">
                              <span className="bg-secondary-background px-2 py-1 rounded-base text-xs border-2 border-border">
                                {submission.metadata?.timeSpent ? `${submission.metadata.timeSpent}s` : 'N/A'}
                              </span>
                            </TableCell>
                            {form.questions.map((question) => (
                              <TableCell key={question.id} className="max-w-xs">
                                <div className="truncate bg-secondary-background px-2 py-1 rounded-base text-xs border-2 border-border font-base" title={getResponseValue(submission, question.id)}>
                                  {getResponseValue(submission, question.id)}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={5 + form.questions.length} className="font-heading">
                            Total Responses: {filteredSubmissions.length}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-heading text-main-foreground mb-2">No responses found</h3>
                  <p className="text-main-foreground/70 font-base mb-6">
                    {submissions.length === 0 
                      ? "This form hasn't received any responses yet." 
                      : "No responses match your current filters."
                    }
                  </p>
                  {submissions.length === 0 && (
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => {
                          const formUrl = `${window.location.origin}/form/${form.shareableLink}`;
                          navigator.clipboard.writeText(formUrl);
                          toast("Form link copied to clipboard!", {
                            description: "Share this link to collect responses",
                            action: {
                              label: "Open",
                              onClick: () => window.open(formUrl, '_blank'),
                            },
                          });
                        }}
                        variant="default"
                      >
                        Copy Form Link
                      </Button>
                      <Button
                        onClick={() => window.open(`/form/${form.shareableLink}`, '_blank')}
                        variant="neutral"
                      >
                        Preview Form
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormResponsesView;
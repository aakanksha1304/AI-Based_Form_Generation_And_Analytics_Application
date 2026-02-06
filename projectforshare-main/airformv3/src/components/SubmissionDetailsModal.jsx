import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, Clock, Monitor, Globe } from 'lucide-react';
import { getSubmissionDetails } from '../utils/formApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SubmissionDetailsModal = ({ submissionId, isOpen, onClose }) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchSubmissionDetails();
    }
  }, [isOpen, submissionId]);

  const fetchSubmissionDetails = async () => {
    setLoading(true);
    try {
      const response = await getSubmissionDetails(submissionId);
      if (response.response) {
        setSubmission(response.submission);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Error loading submission details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAnswer = (response) => {
    const { answer, questionType } = response;

    if (Array.isArray(answer)) {
      return (
        <div className="space-y-1">
          {answer.map((item, index) => (
            <span key={index} className="inline-block bg-main text-main-foreground px-2 py-1 rounded-base border-2 border-border text-sm mr-2">
              {item}
            </span>
          ))}
        </div>
      );
    }

    if (questionType === 'email') {
      return (
        <a href={`mailto:${answer}`} className="text-main-foreground hover:text-main-foreground/80 underline font-base">
          {answer}
        </a>
      );
    }

    if (questionType === 'url') {
      return (
        <a href={answer} target="_blank" rel="noopener noreferrer" className="text-main-foreground hover:text-main-foreground/80 underline font-base">
          {answer}
        </a>
      );
    }

    return <span className="text-main-foreground">{answer}</span>;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-secondary-background rounded-base border-2 border-border shadow-shadow"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-border">
                <div>
                  <h2 className="text-xl font-heading text-main-foreground">Submission Details</h2>
                  <p className="text-sm text-main-foreground/70 mt-1">
                    {submission?.formId?.title || 'Form Submission'}
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  variant="neutral"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-border border-t-main rounded-full animate-spin"></div>
                  </div>
                ) : submission ? (
                  <div className="space-y-6">
                    {/* Submission Info */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-main-foreground/60" />
                            <div>
                              <p className="text-xs text-main-foreground/60">Submitted By</p>
                              <p className="text-sm font-base text-main-foreground">
                                {submission.submitterInfo?.email || 'Anonymous'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-main-foreground/60" />
                            <div>
                              <p className="text-xs text-main-foreground/60">Date</p>
                              <p className="text-sm font-base text-main-foreground">
                                {formatDate(submission.submittedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-main-foreground/60" />
                            <div>
                              <p className="text-xs text-main-foreground/60">Time Spent</p>
                              <p className="text-sm font-base text-main-foreground">
                                {submission.metadata?.timeSpent ? `${submission.metadata.timeSpent}s` : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-main-foreground/60" />
                            <div>
                              <p className="text-xs text-main-foreground/60">Device</p>
                              <p className="text-sm font-base text-main-foreground">
                                {submission.metadata?.deviceType || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-main-foreground/60" />
                            <span className="text-sm text-main-foreground/70">
                              Browser: {submission.metadata?.browser || 'Unknown'}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-base text-xs font-base border-2 border-border ${
                            submission.status === 'new' ? 'bg-chart-1 text-main-foreground' :
                            submission.status === 'reviewed' ? 'bg-chart-3 text-main-foreground' :
                            'bg-chart-4 text-main-foreground'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Form Responses */}
                    <div>
                      <h3 className="text-lg font-heading text-main-foreground mb-4">Form Responses</h3>
                      <div className="space-y-4">
                        {submission.responses?.map((response, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="mb-2">
                                <h4 className="font-base text-main-foreground">{response.question}</h4>
                                <p className="text-xs text-main-foreground/60 mt-1">
                                  Question {index + 1} • {response.questionType}
                                </p>
                              </div>
                              <div className="mt-3">
                                {renderAnswer(response)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info */}
                    {submission.submitterInfo && Object.keys(submission.submitterInfo).length > 1 && (
                      <div>
                        <h3 className="text-lg font-heading text-main-foreground mb-4">Additional Information</h3>
                        <Card>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {submission.submitterInfo.ipAddress && (
                                <div>
                                  <p className="text-xs text-main-foreground/60">IP Address</p>
                                  <p className="text-sm text-main-foreground">{submission.submitterInfo.ipAddress}</p>
                                </div>
                              )}
                              {submission.submitterInfo.location?.country && (
                                <div>
                                  <p className="text-xs text-main-foreground/60">Location</p>
                                  <p className="text-sm text-main-foreground">
                                    {submission.submitterInfo.location.city}, {submission.submitterInfo.location.country}
                                  </p>
                                </div>
                              )}
                              {submission.metadata?.referrer && (
                                <div>
                                  <p className="text-xs text-main-foreground/60">Referrer</p>
                                  <p className="text-sm text-main-foreground">{submission.metadata.referrer}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-main-foreground/70">No submission data found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-border">
                <Button
                  onClick={onClose}
                  variant="neutral"
                >
                  Close
                </Button>
                {submission && (
                  <Button
                    onClick={() => {
                      // TODO: Implement status update
                      alert('Status update functionality coming soon!');
                    }}
                    variant="default"
                  >
                    Mark as Reviewed
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SubmissionDetailsModal;
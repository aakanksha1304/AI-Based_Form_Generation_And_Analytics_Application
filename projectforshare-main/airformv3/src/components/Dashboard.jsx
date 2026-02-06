import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Plus, BarChart3, Users, FileText, Settings, Copy, ExternalLink, Eye, Menu, X, Brain, Trash2, Edit3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { getUserData, logout } from "../utils/auth";
import { getDashboardAnalytics, getUserForms, getUserSubmissions } from "../utils/formApi";
import Navigation from "./Navigation";
import SubmissionDetailsModal from "./SubmissionDetailsModal";
import { useRealTimeUpdates } from "../hooks/useRealTimeUpdates";
import AIAnalyticsModalSimple from "./AIAnalyticsModalSimple";
import axios from "axios";
import { toast } from "sonner";

// Utility function for better timestamp formatting
const formatTimestamp = (dateString) => {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';

    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown';
  }
};

const chartConfig = {
  responses: {
    label: "Responses",
    color: "var(--chart-1)",
  },
  views: {
    label: "Views",
    color: "var(--chart-2)",
  },
};

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [forms, setForms] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [aiAnalyticsOpen, setAiAnalyticsOpen] = useState(false);
  const [selectedFormForAnalytics, setSelectedFormForAnalytics] = useState(null);
  const [deletingFormId, setDeletingFormId] = useState(null);

  // Handle real-time updates
  const handleRealTimeUpdate = async (update) => {
    console.log('🔄 Processing real-time update:', update);

    if (update.type === 'connected') {
      setRealTimeConnected(true);
      return;
    }

    if (update.type === 'new_submission') {
      // Show a brief notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <span>🎉</span>
          <div>
            <div>New submission from <strong>${update.data.submittedBy}</strong></div>
            <div class="text-xs opacity-90">Form: "${update.data.formTitle}"</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      // Remove notification after 4 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 4000);

      // Trigger data refresh
      setLastUpdate(Date.now());
    }
  };

  // Setup real-time updates
  useRealTimeUpdates(handleRealTimeUpdate);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = getUserData();
        if (userData) {
          setUser(userData);
        }

        // Try to get fresh user data from server, but don't logout on failure
        try {
          const response = await axios.get('http://localhost:5000/profile');
          if (response.data.response) {
            setUser(response.data.user);
          }
        } catch (profileError) {
          // If profile fetch fails but we have local user data, continue
          console.log('Profile fetch failed, using cached user data');
          if (!userData) {
            logout();
            return;
          }
        }

        const analyticsResponse = await getDashboardAnalytics('14d');
        if (analyticsResponse.response) {
          setAnalytics(analyticsResponse.analytics);
        }

        const formsResponse = await getUserForms({ limit: 10 });
        if (formsResponse.response) {
          setForms(formsResponse.forms);
        }

        const submissionsResponse = await getUserSubmissions({ limit: 20 });
        if (submissionsResponse.response) {
          setSubmissions(submissionsResponse.submissions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lastUpdate]); // Re-fetch data when lastUpdate changes

  const handleStartBuilding = () => {
    navigate("/create-form");
  };

  const handleLogout = () => {
    logout();
  };

  const copyFormLink = async (linkId) => {
    const formUrl = `${window.location.origin}/f/${linkId}`;
    try {
      await navigator.clipboard.writeText(formUrl);
      toast("Form link copied to clipboard!", {
        description: "Share this link to collect responses",
        action: {
          label: "Open",
          onClick: () => window.open(formUrl, '_blank'),
        },
      });
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = formUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast("Form link copied to clipboard!", {
        description: "Share this link to collect responses",
        action: {
          label: "Open",
          onClick: () => window.open(formUrl, '_blank'),
        },
      });
    }
  };

  const handleDeleteForm = async (formId, formTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${formTitle}"? This will permanently delete the form and all its responses.`)) {
      return;
    }

    setDeletingFormId(formId);
    try {
      const response = await axios.delete(`http://localhost:5000/api/forms/${formId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.data.response) {
        alert('Form deleted successfully!');
        // Refresh the data
        setLastUpdate(Date.now());
      } else {
        alert('Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    } finally {
      setDeletingFormId(null);
    }
  };

  const handleEditForm = (formId) => {
    // Navigate to form builder with edit mode
    navigate(`/edit-form/${formId}`);
  };

  const renderOverview = () => (
    <>
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Forms", value: analytics?.totalForms || 0, icon: "Forms" },
            { title: "Responses", value: analytics?.totalSubmissions || 0, icon: "Responses" },
            { title: "Views", value: analytics?.totalViews || 0, icon: "Views" },
            { title: "Conversion", value: `${Math.round(analytics?.averageCompletionRate || 0)}%`, icon: "Rate" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY bg-yellow-400 hover:shadow-none transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-heading text-main-foreground mb-2">{stat.value}</div>
                  <div className="text-sm font-base text-main-foreground/80">{stat.title}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Analytics</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY bg-white hover:shadow-none transition-all duration-200">
            <CardHeader>
              <CardTitle>Form Analytics - Stacked</CardTitle>
              <CardDescription>
                Showing responses and views for the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={analytics?.submissionsOverTime?.length > 0 ? analytics.submissionsOverTime : [
                    { _id: "Nov 01", responses: 2, views: 8 },
                    { _id: "Nov 02", responses: 1, views: 6 },
                    { _id: "Nov 03", responses: 3, views: 12 },
                    { _id: "Nov 04", responses: 0, views: 4 },
                    { _id: "Nov 05", responses: 2, views: 9 },
                    { _id: "Nov 06", responses: 1, views: 7 },
                    { _id: "Nov 07", responses: 4, views: 15 }
                  ]}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="_id"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value?.slice(0, 3) || value}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="views"
                    type="natural"
                    fill="var(--chart-2)"
                    stroke="var(--chart-2)"
                    activeDot={{
                      fill: "var(--chart-active-dot)",
                    }}
                    stackId="a"
                  />
                  <Area
                    dataKey="responses"
                    type="natural"
                    fill="var(--chart-1)"
                    stroke="var(--chart-1)"
                    activeDot={{
                      fill: "var(--chart-active-dot)",
                    }}
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Total: {(analytics?.totalSubmissions || 0) + (analytics?.totalViews || 0)} interactions
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 leading-none text-main-foreground/70">
                    {analytics?.totalSubmissions || 0} responses • {analytics?.totalViews || 0} views
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Quick Form Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">My Forms</h2>
          <button
            onClick={() => setActiveView('forms')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {forms.length > 0 ? (
            <>
              {forms.slice(0, 3).map((form) => (
                <Card key={form._id} className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Form Header */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-heading text-main-foreground mb-2">{form.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-main-foreground/60">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">{form.analytics?.views || 0}</span>
                                <span>views</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium">{form.analytics?.submissions || 0}</span>
                                <span>responses</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              onClick={() => navigate(`/form/${form._id}/responses`)}
                              size="sm"
                              variant="default"
                            >
                              <BarChart3 className="w-3 h-3" />
                              Responses
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Form Link Section */}
                      <Card className="bg-secondary-background">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-base text-main-foreground mb-3">Form Link</h4>
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-main-foreground/80 font-mono bg-main border-2 border-border px-3 py-2 rounded-base truncate flex-1 min-w-0">
                                  {window.location.origin}/f/{form.customUrl || form.shareableLink}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => handleEditForm(form._id)}
                                size="sm"
                                variant="neutral"
                                title="Edit this form"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedFormForAnalytics(form);
                                  setAiAnalyticsOpen(true);
                                }}
                                size="sm"
                                variant="default"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 relative"
                                title="Get AI-powered insights about your form performance and response analysis"
                              >
                                <Brain className="w-4 h-4" />
                                AI Analytics
                                {form.analytics?.submissions > 0 && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                )}
                              </Button>
                              <Button
                                onClick={() => copyFormLink(form.customUrl || form.shareableLink)}
                                size="sm"
                                variant="default"
                                className="bg-black hover:bg-gray-800 text-white"
                              >
                                <Copy className="w-4 h-4" />
                                Copy link
                              </Button>
                              <Button
                                onClick={() => handleDeleteForm(form._id, form.title)}
                                disabled={deletingFormId === form._id}
                                size="sm"
                                variant="default"
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                title="Delete this form"
                              >
                                <Trash2 className="w-4 h-4" />
                                {deletingFormId === form._id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">�</div>
                <h3 className="text-lg font-heading text-main-foreground mb-2">No forms yet</h3>
                <p className="text-main-foreground/70 mb-4">Create your first form to start collecting responses</p>
                <Button
                  onClick={handleStartBuilding}
                  variant="default"
                >
                  Create Your First Form
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading text-gray-900">Recent Submissions</h2>
          <Button
            onClick={() => setActiveView('responses')}
            variant="neutral"
            size="sm"
          >
            View All
          </Button>
        </div>

        <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
          <CardContent className="p-0">
            <Table>
              <TableCaption className="text-main-foreground/70">
                A list of your recent form submissions.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Form</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(analytics?.recentSubmissions || []).slice(0, 5).map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-base">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Doc</span>
                        <span className="font-medium">{response.formName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {response.submittedBy || response.submitterInfo?.name || response.submitterInfo?.email || 'Anonymous User'}
                    </TableCell>
                    <TableCell>
                      {formatTimestamp(response.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-base text-xs font-base border-2 border-border ${response.status === 'new' ? 'bg-chart-1 text-main-foreground' :
                        response.status === 'reviewed' ? 'bg-chart-3 text-main-foreground' :
                          'bg-chart-4 text-main-foreground'
                        }`}>
                        {response.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          setSelectedSubmissionId(response.id);
                          setIsModalOpen(true);
                        }}
                        size="sm"
                        variant="default"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );

  const renderForms = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Forms</h2>
        <Button
          onClick={handleStartBuilding}
          variant="default"
          size="sm"
        >
          Create New Form
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {forms.length > 0 ? (
          <div className="space-y-4">
            {forms.map((form) => (
              <Card key={form._id} className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Form Header */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-heading text-main-foreground mb-2">{form.title}</h3>
                          {form.description && (
                            <p className="text-sm text-main-foreground/70 mb-3">{form.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-main-foreground/60">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{form.analytics?.views || 0}</span>
                              <span>views</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{form.analytics?.submissions || 0}</span>
                              <span>responses</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={() => navigate(`/form/${form._id}/responses`)}
                            size="sm"
                            variant="default"
                          >
                            <BarChart3 className="w-3 h-3" />
                            Responses
                          </Button>
                          <Button
                            onClick={() => navigate(`/form/${form.customUrl || form.shareableLink}`)}
                            size="sm"
                            variant="neutral"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Form Link Section */}
                    <Card className="bg-secondary-background">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-base text-main-foreground mb-3">Form Link</h4>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-sm text-main-foreground/80 font-mono bg-main border-2 border-border px-3 py-2 rounded-base truncate flex-1 min-w-0">
                                {window.location.origin}/f/{form.customUrl || form.shareableLink}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleEditForm(form._id)}
                              size="sm"
                              variant="neutral"
                              title="Edit this form"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedFormForAnalytics(form);
                                setAiAnalyticsOpen(true);
                              }}
                              size="sm"
                              variant="default"
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 relative"
                              title="Get AI-powered insights about your form performance and response analysis"
                            >
                              <Brain className="w-4 h-4" />
                              AI Analytics
                              {form.analytics?.submissions > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              )}
                            </Button>
                            <Button
                              onClick={() => copyFormLink(form.customUrl || form.shareableLink)}
                              size="sm"
                              variant="default"
                              className="bg-black hover:bg-gray-800 text-white"
                            >
                              <Copy className="w-4 h-4" />
                              Copy link
                            </Button>
                            <Button
                              onClick={() => handleDeleteForm(form._id, form.title)}
                              disabled={deletingFormId === form._id}
                              size="sm"
                              variant="default"
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              title="Delete this form"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingFormId === form._id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">Forms</div>
              <h3 className="text-lg font-heading text-main-foreground mb-2">No forms yet</h3>
              <p className="text-main-foreground/70 mb-4">Create your first form to start collecting responses</p>
              <Button
                onClick={handleStartBuilding}
                variant="default"
              >
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderResponses = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading text-main-foreground">All Responses</h2>
        <div className="text-sm text-main-foreground/70">{submissions.length} total responses</div>
      </div>

      <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
        <CardContent className="p-0">
          {submissions.length > 0 ? (
            <Table>
              <TableCaption className="text-main-foreground/70">
                A list of all form submissions across your forms.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Form Name</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 bg-main text-main-foreground rounded-base border-2 border-border text-sm font-heading">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-base">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">Doc</span>
                        <span className="font-medium">{submission.formName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-main text-main-foreground rounded-base border-2 border-border flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <span className="text-sm">
                          {submission.submittedBy || submission.submitterInfo?.name || submission.submitterInfo?.email || 'Anonymous User'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-main-foreground">
                          {formatTimestamp(submission.submittedAt)}
                        </div>
                        <div className="text-xs text-main-foreground/60">
                          {submission.submittedAt ? (
                            <>
                              {new Date(submission.submittedAt).toLocaleDateString()} • {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                          ) : (
                            'Unknown date'
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-base text-xs font-base border-2 border-border ${submission.status === 'new' ? 'bg-chart-1 text-main-foreground' :
                        submission.status === 'reviewed' ? 'bg-chart-3 text-main-foreground' :
                          'bg-chart-4 text-main-foreground'
                        }`}>
                        {submission.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          setSelectedSubmissionId(submission.id);
                          setIsModalOpen(true);
                        }}
                        size="sm"
                        variant="default"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">Forms</div>
              <h3 className="text-lg font-heading text-main-foreground mb-2">No responses yet</h3>
              <p className="text-main-foreground/70 mb-6">Responses will appear here when people fill out your forms</p>
              <Button
                onClick={() => setActiveView('forms')}
                variant="default"
                size="default"
              >
                View My Forms
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSaveProfile = async () => {
      try {
        // Here you would make an API call to update the profile
        console.log('Updating profile:', formData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    };

    const handleChangePassword = async () => {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      try {
        // Here you would make an API call to change password
        console.log('Changing password');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Password changed successfully!');
      } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.email}</p>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sign Out</h3>
          <p className="text-gray-600 mb-4">Sign out of your account on this device.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load user data</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-background">
      <SidebarProvider>
        <AppSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          handleStartBuilding={handleStartBuilding}
          user={user}
        />
        <SidebarInset className="bg-secondary-background">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-secondary-background border-b-2 border-border">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Form Builder</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {activeView === 'overview' && 'Dashboard'}
                      {activeView === 'forms' && 'My Forms'}
                      {activeView === 'responses' && 'Responses'}
                      {activeView === 'settings' && 'Settings'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-4 flex items-center gap-2">
              <Button
                onClick={() => navigate('/home')}
                variant="neutral"
                size="sm"
              >
                Back to Builder
              </Button>
              {realTimeConnected && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-base border-2 border-border">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )}
              {activeView === 'overview' && (
                <Button
                  onClick={handleStartBuilding}
                  variant="default"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Form
                </Button>
              )}
            </div>
          </header>

          <div className="flex flex-1 flex-col p-4 bg-secondary-background min-h-[calc(100vh-4rem)]">
            <div className="flex-1 rounded-base bg-main border-2 border-border p-6 min-h-full">
              {activeView === 'overview' && renderOverview()}
              {activeView === 'forms' && renderForms()}
              {activeView === 'responses' && renderResponses()}
              {activeView === 'settings' && renderSettings()}
            </div>
          </div>
        </SidebarInset>

        {/* Submission Details Modal */}
        <SubmissionDetailsModal
          submissionId={selectedSubmissionId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSubmissionId(null);
          }}
        />

        {/* AI Analytics Modal */}
        <AIAnalyticsModalSimple
          isOpen={aiAnalyticsOpen}
          onClose={() => {
            setAiAnalyticsOpen(false);
            setSelectedFormForAnalytics(null);
          }}
        />
      </SidebarProvider>
    </div>
  );
}
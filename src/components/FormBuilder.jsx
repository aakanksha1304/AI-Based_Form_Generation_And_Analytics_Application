import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ImageCard from "@/components/ui/image-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createForm } from '../utils/formApi'
import { getUserData } from '../utils/auth'
import axios from 'axios'

// Sortable Question Item Component
const SortableQuestionItem = ({ question, index, updateQuestion, removeQuestion }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      className="rounded-base border-2 border-border shadow-shadow bg-main mb-4"
      style={style}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-accent/20 rounded-base border border-border"
            >
              <svg className="w-4 h-4 text-main-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <span className="text-sm font-base font-medium text-main-foreground/80">Question {index + 1}</span>
          </div>
          <Button
            onClick={() => removeQuestion(question.id)}
            variant="outline"
            size="sm"
            className="p-2 rounded-base border-2 border-border bg-main text-red-500 hover:bg-red-500/10 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            value={question.question}
            onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
            placeholder="Enter your question..."
            className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
              className="px-3 py-2 rounded-base border-2 border-border bg-main text-main-foreground font-base focus:ring-0 focus:border-border outline-none"
            >
              <option value="text">Text Input</option>
              <option value="textarea">Textarea</option>
              <option value="select">Dropdown</option>
              <option value="radio">Radio Buttons</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
            </select>

            <Input
              type="text"
              value={question.placeholder}
              onChange={(e) => updateQuestion(question.id, 'placeholder', e.target.value)}
              placeholder="Placeholder text..."
              className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
            />
          </div>

          {(question.type === 'select' || question.type === 'radio') && (
            <Card className="rounded-base border-2 border-border shadow-none bg-accent/10">
              <CardContent className="p-3">
                <label className="block text-sm font-base font-medium text-main-foreground/80 mb-3">Options</label>
                <div className="space-y-3">
                  {(question.options || []).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])]
                          newOptions[optionIndex] = e.target.value
                          updateQuestion(question.id, 'options', newOptions)
                        }}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
                      />
                      <Button
                        onClick={() => {
                          const newOptions = (question.options || []).filter((_, idx) => idx !== optionIndex)
                          updateQuestion(question.id, 'options', newOptions)
                        }}
                        variant="outline"
                        size="sm"
                        className="px-3 rounded-base border-2 border-border bg-main text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newOptions = [...(question.options || []), '']
                      updateQuestion(question.id, 'options', newOptions)
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-main-foreground/80 hover:text-main-foreground font-base"
                  >
                    + Add Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FormBuilder = ({ formConfig, onFormUpdate, sampleImages, sampleVideos, editMode = false, formId = null }) => {
  const navigate = useNavigate()
  const [backgroundMedia, setBackgroundMedia] = useState(formConfig.backgroundMedia)
  const [selectedMediaData, setSelectedMediaData] = useState(formConfig.selectedMediaData)
  const [questions, setQuestions] = useState(formConfig.questions || [])
  const [formTitle, setFormTitle] = useState(formConfig.title || '')
  const [formDescription, setFormDescription] = useState(formConfig.description || '')
  const [saving, setSaving] = useState(false)
  const [isFormDetailsOpen, setIsFormDetailsOpen] = useState(true)
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(true)
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true)
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)

  // Name/Email collection settings
  const [requireName, setRequireName] = useState(formConfig.requireName !== false) // Default true
  const [requireEmail, setRequireEmail] = useState(formConfig.requireEmail || false)

  // Form display settings
  const [showTitle, setShowTitle] = useState(formConfig.showTitle !== false) // Default true
  const [showDescription, setShowDescription] = useState(formConfig.showDescription !== false) // Default true

  const [newQuestion, setNewQuestion] = useState({
    id: Date.now(),
    question: '',
    type: 'text',
    placeholder: '',
    options: []
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      const isVideo = file.type.startsWith('video/')

      if (isVideo) {
        const video = document.createElement('video')
        video.onloadedmetadata = () => {
          const mediaData = {
            url: url,
            width: video.videoWidth,
            height: video.videoHeight,
            name: file.name,
            type: 'video'
          }
          setBackgroundMedia(url)
          setSelectedMediaData(mediaData)
          updateForm({ backgroundMedia: url, selectedMediaData: mediaData, questions })
        }
        video.src = url
      } else {
        const img = new Image()
        img.onload = () => {
          const mediaData = {
            url: url,
            width: img.naturalWidth,
            height: img.naturalHeight,
            name: file.name,
            type: 'image'
          }
          setBackgroundMedia(url)
          setSelectedMediaData(mediaData)
          updateForm({ backgroundMedia: url, selectedMediaData: mediaData, questions })
        }
        img.src = url
      }
    }
  }

  const updateForm = (config) => {
    onFormUpdate(config)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(reorderedQuestions);
      updateForm({ backgroundMedia, selectedMediaData, questions: reorderedQuestions });
    }
  };

  const handleSaveForm = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    // Ensure at least one of Name or Email is required
    const finalRequireName = requireName || !requireEmail; // Default to name if neither selected
    const finalRequireEmail = requireEmail;

    setSaving(true)
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        questions: questions,
        backgroundMedia: selectedMediaData ? {
          type: selectedMediaData.type,
          url: backgroundMedia,
          name: selectedMediaData.name
        } : null,
        settings: {
          isPublic: true,
          allowMultipleSubmissions: true,
          showProgressBar: true,
          requireName: finalRequireName,
          requireEmail: finalRequireEmail,
          showTitle: showTitle,
          showDescription: showDescription
        }
      }

      let response;
      if (editMode && formId) {
        // Update existing form
        response = await axios.put(`http://localhost:5000/api/forms/${formId}`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
      } else {
        // Create new form
        response = await createForm(formData);
      }

      if (response.data?.response || response.response) {
        const successMessage = editMode
          ? `Form "${formTitle || 'Untitled Form'}" has been updated successfully!`
          : `Form "${formTitle || 'Untitled Form'}" has been published successfully!\nShareable link: ${window.location.origin}/form/${response.data?.form?.shareableLink || response.form?.shareableLink}`;

        alert(successMessage);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving form:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
      alert(`Error saving form: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSampleMediaSelect = (mediaData) => {
    setBackgroundMedia(mediaData.url)
    setSelectedMediaData(mediaData)
    updateForm({ backgroundMedia: mediaData.url, selectedMediaData: mediaData, questions })
  }

  const addQuestion = () => {
    if (newQuestion.question.trim()) {
      const updatedQuestions = [...questions, { ...newQuestion, id: Date.now() }]
      setQuestions(updatedQuestions)
      updateForm({ backgroundMedia, selectedMediaData, questions: updatedQuestions })
      setNewQuestion({
        id: Date.now(),
        question: '',
        type: 'text',
        placeholder: '',
        options: []
      })
    }
  }

  const removeQuestion = (id) => {
    const updatedQuestions = questions.filter(q => q.id !== id)
    setQuestions(updatedQuestions)
    updateForm({ backgroundMedia, selectedMediaData, questions: updatedQuestions })
  }

  const updateQuestion = (id, field, value) => {
    const updatedQuestions = questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    )
    setQuestions(updatedQuestions)
    updateForm({ backgroundMedia, selectedMediaData, questions: updatedQuestions })
  }

  const addOption = (questionId) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...(q.options || []), ''] }
        : q
    )
    setQuestions(updatedQuestions)
    updateForm({ backgroundMedia, selectedMediaData, questions: updatedQuestions })
  }

  const updateOption = (questionId, optionIndex, value) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
        }
        : q
    )
    setQuestions(updatedQuestions)
    updateForm({ backgroundMedia, selectedMediaData, questions: updatedQuestions })
  }

  const removeOption = (questionId, optionIndex) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.filter((_, idx) => idx !== optionIndex)
        }
        : q
    )
    setQuestions(updatedQuestions)
    updateForm({ backgroundMedia, selectedMediaData, questions: updatedQuestions })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder Panel */}
        <div className="space-y-6">
          {/* Form Details */}
          <Card className="rounded-base border-2 border-border shadow-shadow bg-main">
            <Collapsible open={isFormDetailsOpen} onOpenChange={setIsFormDetailsOpen}>
              <CardContent className="p-6">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <h3 className="text-lg font-heading font-bold text-main-foreground">Form Details</h3>
                    <svg
                      className={`w-4 h-4 text-main-foreground transition-transform duration-200 ${isFormDetailsOpen ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-base font-medium text-main-foreground/80">
                        Form Title (Optional)
                      </label>
                      <Input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter form title..."
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-base font-medium text-main-foreground/80">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Describe what this form is for..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border outline-none resize-none"
                      />
                    </div>

                    {/* Name/Email Collection Settings */}
                    <Card className="rounded-base border-2 border-border shadow-none bg-accent/10 bg-yellow-400">
                      <CardContent className="p-4">
                        <label className="block text-sm font-base font-medium text-main-foreground/80 mb-3 ">
                          Submitter Information (At least one required)
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={requireName}
                              onChange={(e) => {
                                const newRequireName = e.target.checked;
                                if (!newRequireName && !requireEmail) {
                                  setRequireEmail(true);
                                }
                                setRequireName(newRequireName);
                              }}
                              className="w-4 h-4 rounded-none border-2 border-border bg-main text-accent focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-main-foreground font-base text-sm">Require Name</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={requireEmail}
                              onChange={(e) => {
                                const newRequireEmail = e.target.checked;
                                if (!newRequireEmail && !requireName) {
                                  setRequireName(true);
                                }
                                setRequireEmail(newRequireEmail);
                              }}
                              className="w-4 h-4 rounded-none border-2 border-border bg-main text-accent focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-main-foreground font-base text-sm">Require Email</span>
                          </label>
                        </div>
                        <p className="text-main-foreground/60 text-xs mt-3 font-base">
                          These fields will appear first in your form before other questions
                        </p>
                      </CardContent>
                    </Card>

                    {/* Form Display Settings */}
                    <Card className="rounded-base border-2 border-border shadow-none bg-accent/10 bg-yellow-400">
                      <CardContent className="p-4">
                        <label className="block text-sm font-base font-medium text-main-foreground/80 mb-3">
                          Form Display Options
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showTitle}
                              onChange={(e) => setShowTitle(e.target.checked)}
                              className="w-4 h-4 rounded-none border-2 border-border bg-main text-accent focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-main-foreground font-base text-sm">Show Form Title to Users</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showDescription}
                              onChange={(e) => setShowDescription(e.target.checked)}
                              className="w-4 h-4 rounded-none border-2 border-border bg-main text-accent focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-main-foreground font-base text-sm">Show Form Description to Users</span>
                          </label>
                        </div>
                        <p className="text-main-foreground/60 text-xs mt-3 font-base">
                          Control what information users see when filling out your form
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Collapsible>
          </Card>

          {/* Background Media */}
          <Card className="shadow-none p-0 bg-main text-main-foreground">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Background Media
              </h2>

              {/* Media Carousel */}
              <label className="block text-sm font-base font-medium text-main-foreground/80 mb-3">
                Choose Background Media
              </label>
              <div className="w-full flex-col items-center gap-4 flex mb-6">
                <Carousel className="w-full max-w-[200px]">
                  <CarouselContent>
                    {[...sampleImages, ...sampleVideos].map((media, index) => (
                      <CarouselItem key={media.id}>
                        <div className="p-[10px]">
                          <ImageCard
                            imageUrl={media.url}
                            caption={media.name}
                            onClick={() => handleSampleMediaSelect(media)}
                            className={backgroundMedia === media.url ? 'ring-2 ring-accent' : ''}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>

              {/* Custom Media Upload */}
              <Card className="rounded-base border-2 border-border shadow-none bg-accent/10 mb-6 bg-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="px-4 text-main-foreground/80 font-base text-sm font-medium">OR</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>

                  <label className="block text-sm font-base font-medium text-main-foreground/80 mb-3 text-center">
                    Upload Custom Media
                  </label>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleBackgroundUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-4 py-3 rounded-base border-2 border-border bg-main text-main-foreground font-base text-sm text-center hover:bg-accent/20 transition-colors duration-200 cursor-pointer">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Choose Image or Video</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-main-foreground/60 text-xs mt-2 text-center font-base">
                    Supports JPG, PNG, GIF, MP4, WebM
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>



        </div>

        {/* Right Column */}
        <div className="flex flex-col lg:h-screen lg:sticky lg:top-6">
          {/* Live Preview - Fixed */}
          <div className="mb-6">
            <Card className="rounded-base border-2 border-border shadow-shadow bg-main">
              <Collapsible open={isLivePreviewOpen} onOpenChange={setIsLivePreviewOpen}>
                <CardContent className="p-6">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    >
                      <h3 className="text-lg font-heading font-bold text-main-foreground">Live Preview</h3>
                      <svg
                        className={`w-4 h-4 text-main-foreground transition-transform duration-200 ${isLivePreviewOpen ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-6">
                    <Card className="rounded-base border-2 border-border shadow-none bg-accent/5 min-h-[400px]">
                      <CardContent className="p-4">
                        {backgroundMedia ? (
                          <div className="relative w-full h-96 rounded-base overflow-hidden border-2 border-border">
                            {selectedMediaData?.type === 'video' ? (
                              <video
                                src={backgroundMedia}
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                loop
                                autoPlay
                              />
                            ) : (
                              <div
                                className="absolute inset-0 w-full h-full"
                                style={{
                                  backgroundImage: `url(${backgroundMedia})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              />
                            )}
                            {questions.length > 0 ? (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <Card className="rounded-base border-2 border-border shadow-shadow bg-main max-w-md w-full">
                                  <CardContent className="p-6">
                                    <h4 className="text-xl font-heading font-bold text-main-foreground mb-4 text-center">
                                      {questions[0].question}
                                    </h4>
                                    <Input
                                      type="text"
                                      placeholder={questions[0].placeholder || "Enter your answer..."}
                                      className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none mb-4"
                                      disabled
                                    />
                                    <Button className="w-full rounded-base border-2 border-border bg-accent text-accent-foreground font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                                      Next
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Card className="rounded-base border-2 border-border shadow-shadow bg-main/90">
                                  <CardContent className="p-4">
                                    <p className="text-main-foreground text-lg font-base font-medium text-center">
                                      Add questions to see preview
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-96">
                            <Card className="rounded-base border-2 border-border shadow-none bg-yellow-400">
                              <CardContent className="p-6 text-center">
                                <div className="mb-4">
                                  <svg className="w-16 h-16 mx-auto text-main-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-lg font-base font-medium text-main-foreground mb-2">No background media selected</p>
                                <p className="text-sm font-base text-main-foreground/60">Choose an image or video to see the preview</p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </CardContent>
              </Collapsible>
            </Card>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 lg:overflow-y-auto lg:max-h-[calc(100vh-500px)] space-y-6 scrollbar-hide">
            {/* Questions List with Drag & Drop */}
            {questions.length > 0 && (
              <Card className="rounded-base border-2 border-border shadow-shadow bg-main">
                <Collapsible open={isQuestionsOpen} onOpenChange={setIsQuestionsOpen}>
                  <CardContent className="p-6">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      >
                        <h3 className="text-lg font-heading font-bold text-main-foreground">
                          Questions ({questions.length}) - Drag to reorder
                        </h3>
                        <svg
                          className={`w-4 h-4 text-main-foreground transition-transform duration-200 ${isQuestionsOpen ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-6">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={questions.map(q => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {questions.map((question, index) => (
                            <SortableQuestionItem
                              key={question.id}
                              question={question}
                              index={index}
                              updateQuestion={updateQuestion}
                              removeQuestion={removeQuestion}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            )}

            {/* Add Question */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full rounded-base border-2 border-border bg-accent text-accent-foreground font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-base border-2 border-accent-foreground bg-accent-foreground text-accent flex items-center justify-center font-heading font-bold text-xs">
                      +
                    </div>
                    Add Question
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-base border-2 border-border shadow-shadow bg-main">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  addQuestion();
                }}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-heading font-bold text-main-foreground">Add New Question</DialogTitle>
                    <DialogDescription className="text-main-foreground/70 font-base">
                      Create a new question for your form. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-3">
                      <label htmlFor="question-text" className="text-sm font-base font-medium text-main-foreground/80">
                        Question Text
                      </label>
                      <Input
                        id="question-text"
                        type="text"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="Enter your question..."
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="question-type" className="text-sm font-base font-medium text-main-foreground/80">
                        Question Type
                      </label>
                      <select
                        id="question-type"
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-base border-2 border-border bg-main text-main-foreground font-base focus:ring-0 focus:border-border outline-none"
                      >
                        <option value="text">Text Input</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Radio Buttons</option>
                      </select>
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="question-placeholder" className="text-sm font-base font-medium text-main-foreground/80">
                        Placeholder Text
                      </label>
                      <Input
                        id="question-placeholder"
                        type="text"
                        value={newQuestion.placeholder}
                        onChange={(e) => setNewQuestion({ ...newQuestion, placeholder: e.target.value })}
                        placeholder="Enter placeholder text..."
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>
                    {(newQuestion.type === 'select' || newQuestion.type === 'radio') && (
                      <div className="grid gap-3">
                        <label className="text-sm font-base font-medium text-main-foreground/80">
                          Options
                        </label>
                        <div className="space-y-3">
                          {(newQuestion.options || []).map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(newQuestion.options || [])]
                                  newOptions[index] = e.target.value
                                  setNewQuestion({ ...newQuestion, options: newOptions })
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-black font-base focus:ring-0 focus:border-border shadow-none"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const newOptions = (newQuestion.options || []).filter((_, idx) => idx !== index)
                                  setNewQuestion({ ...newQuestion, options: newOptions })
                                }}
                                variant="outline"
                                size="sm"
                                className="px-3 rounded-base border-2 border-border bg-main text-red-500 hover:bg-red-500/10 hover:text-red-600 font-base"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            onClick={() => setNewQuestion({
                              ...newQuestion,
                              options: [...(newQuestion.options || []), '']
                            })}
                            variant="ghost"
                            size="sm"
                            className="text-main-foreground/80 hover:text-main-foreground font-base"
                          >
                            + Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="neutral" type="button">Cancel</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className="rounded-base border-2 border-border bg-accent text-accent-foreground font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200"
                    >
                      Add Question
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Publish Form */}
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={saving || questions.length === 0}
                        className="w-full h-12 rounded-base border-2 border-border bg-green-500 text-white font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-shadow"
                      >
                        {saving && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          </div>
                        )}
                        <span className={saving ? 'opacity-0' : 'opacity-100'}>
                          {saving ? (editMode ? 'Updating...' : 'Publishing...') : (editMode ? 'Update Form' : 'Publish Form')}
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-base border-2 border-border shadow-shadow bg-main">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-heading font-bold text-main-foreground">
                          {editMode ? 'Update Your Form?' : 'Publish Your Form?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-main-foreground/80 font-base">
                          {editMode
                            ? 'This will save your changes and update the existing form. All current responses will be preserved.'
                            : 'Once published, you\'ll get a shareable link that anyone can use to fill out your form. You can always edit it later.'
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-base border-2 border-border font-heading">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSaveForm}
                          className="rounded-base border-2 border-border bg-green-500 text-white font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                        >
                          {editMode ? 'Update Form' : 'Publish Form'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                className="w-80 rounded-base border-2 border-border shadow-shadow bg-yellow-400 text-black z-50"
                side="top"
                align="center"
              >
                <div className="space-y-3">
                  <h4 className="text-lg font-heading font-bold text-black">
                    {editMode ? 'Update Your Form' : 'Publish Your Form'}
                  </h4>
                  <p className="text-sm font-base text-black/80">
                    {editMode
                      ? 'Save your changes and update the existing form. All current responses will be preserved.'
                      : 'Once published, you\'ll get a shareable link that anyone can use to fill out your form.'
                    }
                  </p>
                  <div className="flex items-center gap-2 text-sm font-base text-black/90">
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    {questions.length === 0
                      ? 'Add at least one question to publish'
                      : `Ready to ${editMode ? 'update' : 'publish'} with ${questions.length} question${questions.length !== 1 ? 's' : ''}`
                    }
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormBuilder
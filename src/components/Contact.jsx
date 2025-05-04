'use client'

import { useState } from 'react'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faUser, faPaperPlane, faCommentAlt } from '@fortawesome/free-solid-svg-icons'

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
})

export default function Contact() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  // Form status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState(null)
  const [errors, setErrors] = useState({})
  
  // Animation hook
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData)
      
      // Send the form data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong')
      }
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      
      setFormStatus({ type: 'success', message: 'Message sent successfully!' })
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const errorMap = {}
        error.errors.forEach(err => {
          errorMap[err.path[0]] = err.message
        })
        setErrors(errorMap)
        setFormStatus({ type: 'error', message: 'Please check the form for errors.' })
      } else {
        // Handle other errors
        setFormStatus({ type: 'error', message: error.message || 'Failed to send message.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }
  
  return (
    <section 
      id="contact"
      className="section"
      ref={ref}
    >
      <div className="container mb-20">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title relative inline-block">
            Contact Me
            <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-sky-500 rounded-full"></span>
          </h2>
          <p className="text-zinc-400 mt-6 max-w-xl mx-auto">
            Have a project in mind or want to collaborate? Feel free to reach out through this form and I&apos;ll get back to you as soon as possible.
          </p>
        </motion.div>
        
        <div className="flex justify-center">
          <motion.div 
            className="contact-form-container"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {formStatus && (
              <motion.div 
                className={`form-status ${formStatus.type === 'success' ? 'success' : 'error'}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <span className={`icon ${formStatus.type === 'success' ? 'success' : 'error'}`}>
                    <FontAwesomeIcon icon={formStatus.type === 'success' ? faPaperPlane : faCommentAlt} />
                  </span>
                  {formStatus.message}
                </div>
              </motion.div>
            )}
            
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              <motion.div variants={itemVariants} className="stagger-item">
                <label htmlFor="name" className="form-label">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                  <span>Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Your name"
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </motion.div>
              
              <motion.div variants={itemVariants} className="stagger-item">
                <label htmlFor="email" className="form-label">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </motion.div>
              
              <motion.div variants={itemVariants} className="stagger-item">
                <label htmlFor="subject" className="form-label">
                  <FontAwesomeIcon icon={faCommentAlt} className="icon" />
                  <span>Subject</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`form-input ${errors.subject ? 'error' : ''}`}
                  placeholder="What is this about?"
                />
                {errors.subject && <p className="error-message">{errors.subject}</p>}
              </motion.div>
              
              <motion.div variants={itemVariants} className="stagger-item">
                <label htmlFor="message" className="form-label">
                  <FontAwesomeIcon icon={faPaperPlane} className="icon" />
                  <span>Message</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className={`form-textarea ${errors.message ? 'error' : ''}`}
                  placeholder="Write your message here..."
                />
                {errors.message && <p className="error-message">{errors.message}</p>}
              </motion.div>
              
              <motion.div variants={itemVariants} className="stagger-item">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-button group"
                >
                  <span className="button-text">
                    <FontAwesomeIcon icon={faPaperPlane} className="button-icon" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </span>
                  <span className="button-background"></span>
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
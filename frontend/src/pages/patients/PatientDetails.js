import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  LocalPharmacy as PharmacyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axios from 'axios';
import { checkTokenValidity, forceTokenRefresh } from '../../utils/tokenRefresh';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

// All patient data will be fetched from API








// Communications will be fetched from API

// Helper function to safely format dates
const safeFormatDate = (dateValue, formatString = 'dd MMM yyyy') => {
  if (!dateValue) return 'Not available';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to format medical history
const formatMedicalHistory = (medicalHistory) => {
  if (!medicalHistory) return 'No medical history available';

  const conditions = [];
  
  // Add boolean conditions
  if (medicalHistory.diabetic) conditions.push('Diabetic');
  if (medicalHistory.hypertension) conditions.push('Hypertension');
  if (medicalHistory.pregnant) conditions.push('Pregnant');
  
  // Add array items
  if (medicalHistory.allergies?.length > 0) {
    conditions.push(`Allergies: ${medicalHistory.allergies.join(', ')}`);
  }
  if (medicalHistory.currentMedications?.length > 0) {
    conditions.push(`Current Medications: ${medicalHistory.currentMedications.join(', ')}`);
  }
  if (medicalHistory.pastIllnesses?.length > 0) {
    conditions.push(`Past Illnesses: ${medicalHistory.pastIllnesses.join(', ')}`);
  }
  if (medicalHistory.surgeries?.length > 0) {
    conditions.push(`Surgeries: ${medicalHistory.surgeries.join(', ')}`);
  }

  return conditions.length > 0 ? conditions.join('\n') : 'No significant medical history';
};

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]); // Added prescriptions state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [newDocument, setNewDocument] = useState({
    file: null,
    category: '',
    description: ''
  });
  const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    type: 'WhatsApp',
    message: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Make API calls to fetch patient data
        const patientResponse = await axios.get(`${API_URL}/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Set patient data from API response
        setPatient(patientResponse.data.data);
        
        // Fetch patient appointments
        const appointmentsResponse = await axios.get(`${API_URL}/appointments?patient=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAppointments(appointmentsResponse.data.data || []);
        
        // Fetch patient treatments
        const treatmentsResponse = await axios.get(`${API_URL}/treatments?patient=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTreatments(treatmentsResponse.data.data || []);
        
        // Fetch patient invoices
        const invoicesResponse = await axios.get(`${API_URL}/billing?patient=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInvoices(invoicesResponse.data.data || []);
        
        // Fetch patient documents
        const documentsResponse = await axios.get(`${API_URL}/patients/${id}/documents`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDocuments(documentsResponse.data.data || []);
        
        // Fetch patient communications
        const communicationsResponse = await axios.get(`${API_URL}/patients/${id}/communications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommunications(communicationsResponse.data.data || []);

        // Fetch patient prescriptions
        const prescriptionsResponse = await axios.get(`${API_URL}/prescriptions/patient/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Handle different possible response structures
        let prescriptionsData = [];
        if (prescriptionsResponse.data) {
          if (prescriptionsResponse.data.data) {
            // If response has data.data structure (like getPrescriptionsByPatient)
            if (prescriptionsResponse.data.data.docs) {
              // Paginated response - prescriptions are in data.data.docs
              prescriptionsData = Array.isArray(prescriptionsResponse.data.data.docs) 
                ? prescriptionsResponse.data.data.docs 
                : [];
            } else {
              // Direct data array
              prescriptionsData = Array.isArray(prescriptionsResponse.data.data) 
                ? prescriptionsResponse.data.data 
                : [];
            }
          } else if (prescriptionsResponse.data.docs) {
            // If response has data.docs structure (pagination)
            prescriptionsData = Array.isArray(prescriptionsResponse.data.docs) 
              ? prescriptionsResponse.data.docs 
              : [];
          } else if (Array.isArray(prescriptionsResponse.data)) {
            // If response is directly an array
            prescriptionsData = prescriptionsResponse.data;
          }
        }
        
        setPrescriptions(prescriptionsData);
        
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Please try again.');
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Delete patient via API
      await axios.delete(`${API_URL}/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Patient deleted successfully');
      navigate('/patients');
    } catch (err) {
      console.error('Error deleting patient:', err);
      toast.error('Failed to delete patient');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Document management functions
  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setNewDocument({
      file: null,
      category: '',
      description: ''
    });
    setUploadProgress(0);
    setUploadStatus(null);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setNewDocument({
        ...newDocument,
        file: event.target.files[0]
      });
    }
  };

  const handleDocumentInputChange = (event) => {
    const { name, value } = event.target;
    setNewDocument({
      ...newDocument,
      [name]: value
    });
  };

  const handleDocumentUpload = async () => {
    // Validate inputs
    if (!newDocument.file) {
      showSnackbar('Please select a file to upload', 'error');
      return;
    }

    if (!newDocument.category) {
      showSnackbar('Please select a document category', 'error');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', newDocument.file);
      formData.append('category', newDocument.category);
      formData.append('description', newDocument.description || '');
      
      setUploadStatus('uploading');
      
      // Upload document via API
      const response = await axios.post(`${API_URL}/patients/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadStatus('success');
      
      // Add the new document to the documents list
      const newDoc = response.data.data;
      setDocuments([newDoc, ...documents]);
      
      setTimeout(() => {
        handleUploadDialogClose();
        showSnackbar('Document uploaded successfully', 'success');
      }, 1000);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadStatus('error');
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload document';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleViewDocument = (document) => {
    setCurrentDocument(document);
    setDocumentViewerOpen(true);
  };

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false);
    setCurrentDocument(null);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API call to delete document
      await axios.delete(`${API_URL}/patients/${id}/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setDocuments(documents.filter(doc => doc._id !== documentId));
      showSnackbar('Document deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error(err.response?.data?.message || 'Failed to delete document');
      showSnackbar('Failed to delete document', 'error');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('Please login again to download documents', 'error');
        return;
      }
      
      // Check token validity
      if (!checkTokenValidity(token)) {
        showSnackbar('Session invalid. Refreshing...', 'warning');
        forceTokenRefresh();
        return;
      }
      
      // Show downloading message
      showSnackbar(`Downloading ${doc.fileName}`, 'info');
      
      // Make API call to download document using the global axios instance
      // This ensures we use the same configuration as other API calls
      const response = await axios.get(`${API_URL}/patients/${id}/documents/${doc._id}/download`, {
        responseType: 'blob',
        timeout: 30000
      });
      
      // Verify we got a successful response
      if (response.status !== 200) {
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      // Verify we got blob data
      if (!response.data || response.data.size === 0) {
        throw new Error('Download returned empty file');
      }
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof window.document === 'undefined') {
        throw new Error('Not in a browser environment');
      }
      
      // Use a more reliable download method
      try {
        // Method 1: Create and click a link
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        link.style.display = 'none';
        
        // Add to DOM, click, and cleanup
        window.document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          try {
            if (window.document.body.contains(link)) {
              window.document.body.removeChild(link);
            }
          } catch (cleanupError) {
            console.warn('Cleanup error:', cleanupError);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        
      } catch (domError) {
        console.warn('DOM method failed, trying alternative download method:', domError);
        
        // Method 2: Use window.open as fallback
        try {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          
          // Cleanup after a delay
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
          
        } catch (fallbackError) {
          console.error('All download methods failed:', fallbackError);
          throw new Error('Unable to trigger download in this browser');
        }
      }
      
              showSnackbar(`${doc.fileName} downloaded successfully`, 'success');
      
    } catch (err) {
      console.error('Download error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        showSnackbar('Session expired. Please login again.', 'error');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response?.status === 404) {
        showSnackbar('Document not found on server', 'error');
      } else if (err.code === 'ECONNABORTED') {
        showSnackbar('Download timeout. Please try again.', 'error');
      } else {
        showSnackbar(`Download failed: ${err.message}`, 'error');
      }
    }
  };

  // Communication functions
  const handleSendMessageDialogOpen = () => {
    setSendMessageDialogOpen(true);
  };

  const handleSendMessageDialogClose = () => {
    setSendMessageDialogOpen(false);
    setNewMessage({
      type: 'WhatsApp',
      message: ''
    });
  };

  const handleMessageInputChange = (event) => {
    const { name, value } = event.target;
    setNewMessage({
      ...newMessage,
      [name]: value
    });
  };

  const handleSendMessage = async () => {
    // Validate inputs
    if (!newMessage.message.trim()) {
      showSnackbar('Please enter a message', 'error');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Send message via API
      const response = await axios.post(`${API_URL}/patients/${id}/communications`, newMessage, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Add the new communication to the list
      const newComm = response.data;
      
      // Update local state
      setCommunications([newComm, ...communications]);
      handleSendMessageDialogClose();
      showSnackbar(`Message sent via ${newMessage.type}`, 'success');
    } catch (err) {
      console.error('Error sending message:', err);
      showSnackbar('Failed to send message', 'error');
    }
  };

  // Prescription functions
  const handleViewPrescription = (prescription) => {
    // For now, navigate to prescriptions page with the prescription ID
    // In the future, this could open a modal or navigate to a detailed view
    navigate(`/prescriptions?selectedPrescription=${prescription._id}`);
  };

  const handleEditPrescription = (prescription) => {
    // Navigate to prescriptions page with edit mode
    navigate(`/prescriptions?editPrescription=${prescription._id}`);
  };

  // Utility functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon color="error" />;
    } else {
      return <FileIcon color="action" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/patients')}
          >
            Back to Patients
          </Button>
        </Box>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Patient not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/patients')}
          >
            Back to Patients
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with patient name and actions */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/patients')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Chip 
              label={patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : 'Other'} 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/patients/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">+91 {patient.phone}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{patient.email || 'No email'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Patient ID: {patient.patientId || patient._id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Registered: {safeFormatDate(patient.createdAt)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different sections */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Appointments" />
          <Tab label="Treatments" />
          <Tab label="Invoices" />
          <Tab label="Documents & Images" />
          <Tab label="Communication" />
          <Tab label="Prescriptions" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ mb: 4 }}>
        {/* Overview Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                    <Typography variant="body1">{patient.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                    <Typography variant="body1">
                      {safeFormatDate(patient.dateOfBirth)} ({patient.age} years)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {patient.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Blood Group</Typography>
                    <Typography variant="body1">{patient.bloodGroup || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Occupation</Typography>
                    <Typography variant="body1">{patient.occupation || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Referred By</Typography>
                    <Typography variant="body1">{patient.referredBy || 'Not specified'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography variant="body1">
                      {patient.address?.street || ''}, {patient.address?.city || ''}, {patient.address?.state || ''} - {patient.address?.pincode || ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">+91 {patient.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{patient.email || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Emergency Contact</Typography>
                    <Typography variant="body1">
                      {patient.emergencyContactName} (Phone: +91 {patient.emergencyContactPhone})
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Medical Information */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Medical Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Medical History</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {formatMedicalHistory(patient.medicalHistory)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Clinic Information */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Clinic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Primary Clinic</Typography>
                    <Typography variant="body1">{patient.registeredClinic?.name || 'Not assigned'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Registration Date</Typography>
                    <Typography variant="body1">
                      {safeFormatDate(patient.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Appointments Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Appointments</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/appointments/add?patientId=${id}`)}
              >
                New Appointment
              </Button>
            </Box>

            {appointments.length === 0 ? (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" align="center">
                  No appointments found for this patient.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {appointments.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
                            <Typography variant="body1">
                              {safeFormatDate(appointment.appointmentDate, 'dd MMM yyyy HH:mm')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                            <Typography variant="body1">{appointment.appointmentType}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Dentist</Typography>
                            <Typography variant="body1">
                              {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <Chip
                              label={appointment.status}
                              color={
                                appointment.status === 'completed' ? 'success' :
                                appointment.status === 'scheduled' ? 'primary' :
                                appointment.status === 'cancelled' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/appointments/${appointment.id}`)}
                            >
                              View
                            </Button>
                          </Grid>
                          {appointment.notes && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                              <Typography variant="body2">{appointment.notes}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Treatments Tab */}
        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Treatments</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/treatments/add?patientId=${id}`)}
              >
                New Treatment
              </Button>
            </Box>

            {treatments.length === 0 ? (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" align="center">
                  No treatments found for this patient.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {treatments.map((treatment) => (
                  <Grid item xs={12} key={treatment.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Treatment</Typography>
                            <Typography variant="body1">{treatment.name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                            <Typography variant="body1">{treatment.category}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                            <Typography variant="body1">{treatment.duration} minutes</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                            <Typography variant="body1">₹{treatment.price}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/treatments/${treatment.id}`)}
                            >
                              View
                            </Button>
                          </Grid>
                          {treatment.notes && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                              <Typography variant="body2">{treatment.notes}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Invoices Tab */}
        {tabValue === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Invoices</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/billing/create?patientId=${id}`)}
              >
                New Invoice
              </Button>
            </Box>

            {invoices.length === 0 ? (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" align="center">
                  No invoices found for this patient.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {invoices.map((invoice) => (
                  <Grid item xs={12} key={invoice.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Invoice Date</Typography>
                            <Typography variant="body1">
                              {safeFormatDate(invoice.invoiceDate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                            <Typography variant="body1">
                              ₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <Chip
                              label={invoice.paymentStatus}
                              color={
                                invoice.paymentStatus === 'paid' ? 'success' :
                                invoice.paymentStatus === 'pending' ? 'warning' :
                                invoice.paymentStatus === 'overdue' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                            >
                              View
                            </Button>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">Items</Typography>
                            <List dense>
                              {invoice.items.map((item, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemText
                                    primary={item.description}
                                    secondary={`₹${(item.amount || 0).toLocaleString('en-IN')}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Documents & Images Tab */}
        {tabValue === 4 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Documents & Images</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={forceTokenRefresh}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Refresh Session
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadDialogOpen}
                >
                  Upload Document
                </Button>
              </Box>
            </Box>

            {documents.length === 0 ? (
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Documents Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload patient documents such as X-rays, lab reports, prescriptions, and consent forms.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadDialogOpen}
                >
                  Upload First Document
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>File</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((document) => (
                      <TableRow key={document._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getFileIcon(document.fileType)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {document.fileName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={document.category} size="small" />
                        </TableCell>
                        <TableCell>{document.description || '-'}</TableCell>
                        <TableCell>{safeFormatDate(document.uploadedAt)}</TableCell>
                        <TableCell>{document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton onClick={() => handleViewDocument(document)} size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton onClick={() => handleDownloadDocument(document)} size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDeleteDocument(document._id)} 
                              size="small" 
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Communication Tab */}
        {tabValue === 5 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Communication History</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleSendMessageDialogOpen}
              >
                Send Message
              </Button>
            </Box>

            {communications.length === 0 ? (
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <MessageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Communication History
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Send appointment reminders, treatment follow-ups, or general communications to the patient.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleSendMessageDialogOpen}
                >
                  Send First Message
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Channel</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Response</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {communications.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          {safeFormatDate(comm.date)}, {comm.time}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={comm.type} 
                            size="small" 
                            color={comm.type === 'WhatsApp' ? 'success' : 'primary'} 
                          />
                        </TableCell>
                        <TableCell>{comm.message}</TableCell>
                        <TableCell>
                          <Chip 
                            label={comm.status} 
                            size="small" 
                            color={comm.status === 'Delivered' || comm.status === 'Read' ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell>
                          {comm.response ? (
                            <Chip 
                              label={comm.response} 
                              size="small" 
                              color="info" 
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">No response</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Prescriptions Tab */}
        {tabValue === 6 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6">Prescription History</Typography>
                <Typography variant="body2" color="text.secondary">
                  Showing prescriptions for {patient?.firstName} {patient?.lastName}
                  {Array.isArray(prescriptions) && prescriptions.length > 0 && (
                    <span> • {prescriptions.length} prescription(s) found</span>
                  )}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/prescriptions?patientId=${patient._id}`)}
              >
                Create Prescription
              </Button>
            </Box>

            {(Array.isArray(prescriptions) && prescriptions.length === 0) ? (
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <PharmacyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Prescriptions Found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This patient hasn't been prescribed any medications yet. Create their first prescription to get started.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/prescriptions?patientId=${patient._id}`)}
                >
                  Create First Prescription
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Prescription #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Medications</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(prescriptions) ? prescriptions : []).map((prescription) => (
                      <TableRow key={prescription._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {prescription.prescriptionNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {safeFormatDate(prescription.date)}
                        </TableCell>
                        <TableCell>
                          Dr. {prescription.doctor?.firstName || ''} {prescription.doctor?.lastName || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {prescription.diagnosis || 'No diagnosis'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {prescription.medications?.length || 0} medication(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            color={
                              prescription.status === 'active' ? 'primary' :
                              prescription.status === 'completed' ? 'success' :
                              prescription.status === 'cancelled' ? 'error' : 'default'
                            }
                            size="small"
                          />
                          {prescription.isIssuedToPatient && (
                            <Chip
                              label="Issued"
                              color="success"
                              size="small"
                              sx={{ ml: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPrescription(prescription)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Prescription">
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={prescription.isIssuedToPatient}
                                onClick={() => handleEditPrescription(prescription)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {patient.firstName} {patient.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Document
          <IconButton
            aria-label="close"
            onClick={handleUploadDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {uploadStatus === 'uploading' ? (
              <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading: {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            ) : uploadStatus === 'success' ? (
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                Document uploaded successfully!
              </Alert>
            ) : uploadStatus === 'error' ? (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                Failed to upload document. Please try again.
              </Alert>
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.dicom"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Box 
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    mb: 3,
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    {newDocument.file ? newDocument.file.name : 'Click to select or drag and drop file here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: PDF, JPG, JPEG, PNG, DICOM
                  </Typography>
                </Box>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Document Category</InputLabel>
                  <Select
                    name="category"
                    value={newDocument.category}
                    onChange={handleDocumentInputChange}
                    label="Document Category"
                  >
                    <MenuItem value="X-Ray (RVG/OPG)">X-Ray (RVG/OPG)</MenuItem>
                    <MenuItem value="Lab Report">Lab Report</MenuItem>
                    <MenuItem value="Prescription">Prescription</MenuItem>
                    <MenuItem value="Medical History Record">Medical History Record</MenuItem>
                    <MenuItem value="Consent Form">Consent Form</MenuItem>
                    <MenuItem value="Insurance Document">Insurance Document</MenuItem>
                    <MenuItem value="Treatment Plan">Treatment Plan</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  margin="normal"
                  fullWidth
                  name="description"
                  label="Description (Optional)"
                  value={newDocument.description}
                  onChange={handleDocumentInputChange}
                  multiline
                  rows={2}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>Cancel</Button>
          {uploadStatus !== 'success' && (
            <Button 
              onClick={handleDocumentUpload} 
              variant="contained" 
              disabled={uploadStatus === 'uploading' || !newDocument.file}
            >
              Upload
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={documentViewerOpen} onClose={handleCloseDocumentViewer} maxWidth="md" fullWidth>
        {currentDocument && (
          <>
            <DialogTitle>
              {currentDocument.fileName}
              <IconButton
                aria-label="close"
                onClick={handleCloseDocumentViewer}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Category: {currentDocument.category}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {currentDocument.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Uploaded on {safeFormatDate(currentDocument.uploadedAt)} by {currentDocument.uploadedBy?.name || 'Unknown User'}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {currentDocument.fileType.startsWith('image/') ? (
                  <Box sx={{ width: '100%', height: '100%', bgcolor: '#f5f5f5', borderRadius: 1, p: 2, textAlign: 'center' }}>
                    <ImageIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="body1">
                      Image preview would be integrated here in a production environment.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />} 
                      sx={{ mt: 2 }}
                      onClick={() => handleDownloadDocument(currentDocument)}
                    >
                      Download Image
                    </Button>
                  </Box>
                ) : currentDocument.fileType === 'application/pdf' ? (
                  <Box sx={{ width: '100%', height: '100%', bgcolor: '#f5f5f5', borderRadius: 1, p: 2, textAlign: 'center' }}>
                    <PdfIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                    <Typography variant="body1">
                      PDF Viewer would be integrated here in a production environment.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />} 
                      sx={{ mt: 2 }}
                      onClick={() => handleDownloadDocument(currentDocument)}
                    >
                      Download PDF
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: '100%', bgcolor: '#f5f5f5', borderRadius: 1, p: 2, textAlign: 'center' }}>
                    <FileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="body1">
                      This file type cannot be previewed.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />} 
                      sx={{ mt: 2 }}
                      onClick={() => handleDownloadDocument(currentDocument)}
                    >
                      Download File
                    </Button>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDocumentViewer}>Close</Button>
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={() => handleDownloadDocument(currentDocument)}
              >
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={sendMessageDialogOpen} onClose={handleSendMessageDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Send Message to Patient
          <IconButton
            aria-label="close"
            onClick={handleSendMessageDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Communication Channel</InputLabel>
              <Select
                name="type"
                value={newMessage.type}
                onChange={handleMessageInputChange}
                label="Communication Channel"
              >
                <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                <MenuItem value="SMS">SMS</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              name="message"
              label="Message"
              value={newMessage.message}
              onChange={handleMessageInputChange}
              multiline
              rows={4}
              required
            />

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Patient Contact Information:
              </Typography>
              <Typography variant="body2">
                Phone: +91 {patient.phone}
              </Typography>
              {patient.email && (
                <Typography variant="body2">
                  Email: {patient.email}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendMessageDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={!newMessage.message.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientDetails;
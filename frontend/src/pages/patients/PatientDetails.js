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
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Mock data for a patient
const MOCK_PATIENT = {
  id: '123456',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul.sharma@example.com',
  phone: '9876543210',
  gender: 'male',
  dateOfBirth: '1985-06-15',
  age: 38,
  address: '123 Main Street, Bandra West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  bloodGroup: 'O+',
  allergies: 'Penicillin',
  medicalHistory: 'Hypertension, Diabetes Type 2',
  emergencyContactName: 'Priya Sharma',
  emergencyContactPhone: '9876543211',
  clinic: { id: 1, name: 'Dental Care - Bandra' },
  registrationDate: '2022-03-10',
  occupation: 'Software Engineer',
  referredBy: 'Dr. Patel',
};

// Mock data for appointments
const MOCK_APPOINTMENTS = [
  {
    id: 'apt1',
    date: '2023-06-10',
    time: '10:00 AM',
    dentist: 'Dr. Mehta',
    type: 'Check-up',
    status: 'completed',
    notes: 'Regular check-up, no issues found',
  },
  {
    id: 'apt2',
    date: '2023-07-15',
    time: '11:30 AM',
    dentist: 'Dr. Mehta',
    type: 'Cleaning',
    status: 'completed',
    notes: 'Routine cleaning performed',
  },
  {
    id: 'apt3',
    date: '2023-09-05',
    time: '09:15 AM',
    dentist: 'Dr. Singh',
    type: 'Filling',
    status: 'completed',
    notes: 'Filled cavity in lower right molar',
  },
  {
    id: 'apt4',
    date: '2023-12-20',
    time: '02:00 PM',
    dentist: 'Dr. Mehta',
    type: 'Check-up',
    status: 'scheduled',
    notes: 'Regular 6-month check-up',
  },
];

// Mock data for treatments
const MOCK_TREATMENTS = [
  {
    id: 'trt1',
    name: 'Root Canal',
    tooth: '16',
    startDate: '2023-06-10',
    endDate: '2023-06-24',
    dentist: 'Dr. Singh',
    status: 'completed',
    notes: 'Root canal treatment for upper right molar',
  },
  {
    id: 'trt2',
    name: 'Dental Crown',
    tooth: '16',
    startDate: '2023-07-01',
    endDate: '2023-07-15',
    dentist: 'Dr. Singh',
    status: 'completed',
    notes: 'Crown placed on tooth after root canal',
  },
  {
    id: 'trt3',
    name: 'Teeth Whitening',
    tooth: 'All',
    startDate: '2023-09-05',
    endDate: '2023-09-05',
    dentist: 'Dr. Mehta',
    status: 'completed',
    notes: 'Professional whitening treatment',
  },
];

// Mock data for invoices
const MOCK_INVOICES = [
  {
    id: 'inv1',
    date: '2023-06-24',
    amount: 12000,
    status: 'paid',
    items: [
      { name: 'Root Canal', price: 8000 },
      { name: 'Consultation', price: 500 },
      { name: 'X-Ray', price: 1500 },
      { name: 'Medication', price: 2000 },
    ],
  },
  {
    id: 'inv2',
    date: '2023-07-15',
    amount: 15000,
    status: 'paid',
    items: [
      { name: 'Dental Crown', price: 12000 },
      { name: 'Consultation', price: 500 },
      { name: 'X-Ray', price: 1500 },
      { name: 'Temporary Crown', price: 1000 },
    ],
  },
  {
    id: 'inv3',
    date: '2023-09-05',
    amount: 5000,
    status: 'pending',
    items: [
      { name: 'Teeth Whitening', price: 4500 },
      { name: 'Consultation', price: 500 },
    ],
  },
];

// Mock data for patient documents
const MOCK_DOCUMENTS = [
  {
    id: 'doc1',
    fileName: 'dental_xray_20230610.jpg',
    fileType: 'image/jpeg',
    category: 'X-Ray (RVG/OPG)',
    description: 'Full mouth X-ray before root canal treatment',
    uploadDate: '2023-06-10',
    uploadedBy: 'Dr. Singh',
    size: '2.4 MB',
    url: 'https://example.com/xray1.jpg',
  },
  {
    id: 'doc2',
    fileName: 'treatment_consent_form.pdf',
    fileType: 'application/pdf',
    category: 'Consent Form',
    description: 'Signed consent for root canal procedure',
    uploadDate: '2023-06-10',
    uploadedBy: 'Receptionist',
    size: '156 KB',
    url: 'https://example.com/consent.pdf',
  },
  {
    id: 'doc3',
    fileName: 'prescription_20230624.pdf',
    fileType: 'application/pdf',
    category: 'Prescription',
    description: 'Post-treatment medications',
    uploadDate: '2023-06-24',
    uploadedBy: 'Dr. Singh',
    size: '98 KB',
    url: 'https://example.com/prescription.pdf',
  },
  {
    id: 'doc4',
    fileName: 'insurance_claim_form.pdf',
    fileType: 'application/pdf',
    category: 'Insurance Document',
    description: 'Insurance claim for root canal treatment',
    uploadDate: '2023-06-25',
    uploadedBy: 'Admin Staff',
    size: '320 KB',
    url: 'https://example.com/insurance.pdf',
  },
  {
    id: 'doc5',
    fileName: 'treatment_plan.pdf',
    fileType: 'application/pdf',
    category: 'Treatment Plan',
    description: 'Comprehensive dental treatment plan',
    uploadDate: '2023-06-10',
    uploadedBy: 'Dr. Singh',
    size: '450 KB',
    url: 'https://example.com/treatment_plan.pdf',
  },
];

// Mock data for communication history
const MOCK_COMMUNICATIONS = [
  {
    id: 'comm1',
    type: 'WhatsApp',
    date: '2023-06-09',
    time: '10:30 AM',
    message: 'Reminder: Your dental appointment is scheduled for tomorrow at 10:00 AM with Dr. Singh.',
    status: 'Delivered',
    response: 'Confirmed',
  },
  {
    id: 'comm2',
    type: 'SMS',
    date: '2023-06-23',
    time: '09:15 AM',
    message: 'Your prescription is ready for pickup at Smile Dental Care clinic.',
    status: 'Delivered',
    response: null,
  },
  {
    id: 'comm3',
    type: 'WhatsApp',
    date: '2023-07-14',
    time: '02:00 PM',
    message: 'Reminder: Your follow-up appointment for crown fitting is scheduled for tomorrow at 11:30 AM.',
    status: 'Delivered',
    response: 'Confirmed',
  },
  {
    id: 'comm4',
    type: 'WhatsApp',
    date: '2023-09-04',
    time: '06:00 PM',
    message: 'Reminder: Your teeth whitening appointment is scheduled for tomorrow at 09:15 AM with Dr. Mehta.',
    status: 'Delivered',
    response: 'Confirmed',
  },
  {
    id: 'comm5',
    type: 'SMS',
    date: '2023-12-13',
    time: '05:00 PM',
    message: 'Reminder: Your regular dental check-up is scheduled for next week on Dec 20 at 02:00 PM.',
    status: 'Delivered',
    response: null,
  },
];

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [communications, setCommunications] = useState([]);
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

        // In a real app, these would be API calls
        // const patientResponse = await axios.get(`/api/patients/${id}`);
        // const appointmentsResponse = await axios.get(`/api/patients/${id}/appointments`);
        // const treatmentsResponse = await axios.get(`/api/patients/${id}/treatments`);
        // const invoicesResponse = await axios.get(`/api/patients/${id}/invoices`);
        // const documentsResponse = await axios.get(`/api/patients/${id}/documents`);
        // const communicationsResponse = await axios.get(`/api/patients/${id}/communications`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Set mock data
        setPatient(MOCK_PATIENT);
        setAppointments(MOCK_APPOINTMENTS);
        setTreatments(MOCK_TREATMENTS);
        setInvoices(MOCK_INVOICES);
        setDocuments(MOCK_DOCUMENTS);
        setCommunications(MOCK_COMMUNICATIONS);
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
      // In a real app, this would be an API call
      // await axios.delete(`/api/patients/${id}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      // In a real app, this would be an API call with FormData
      // const formData = new FormData();
      // formData.append('file', newDocument.file);
      // formData.append('category', newDocument.category);
      // formData.append('description', newDocument.description);
      // 
      // const response = await axios.post(`/api/patients/${id}/documents`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   },
      //   onUploadProgress: (progressEvent) => {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     setUploadProgress(percentCompleted);
      //   }
      // });

      // Simulate upload progress
      setUploadStatus('uploading');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          
          // Simulate API response with new document
          const newDoc = {
            id: `doc${documents.length + 1}`,
            fileName: newDocument.file.name,
            fileType: newDocument.file.type,
            category: newDocument.category,
            description: newDocument.description || 'No description provided',
            uploadDate: new Date().toISOString().split('T')[0],
            uploadedBy: 'Current User',
            size: `${(newDocument.file.size / 1024).toFixed(0)} KB`,
            url: URL.createObjectURL(newDocument.file)
          };
          
          setDocuments([newDoc, ...documents]);
          
          setTimeout(() => {
            handleUploadDialogClose();
            showSnackbar('Document uploaded successfully', 'success');
          }, 1000);
        }
      }, 300);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadStatus('error');
      showSnackbar('Failed to upload document', 'error');
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
      // In a real app, this would be an API call
      // await axios.delete(`/api/patients/${id}/documents/${documentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      showSnackbar('Document deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting document:', err);
      showSnackbar('Failed to delete document', 'error');
    }
  };

  const handleDownloadDocument = (document) => {
    // In a real app, this would trigger a download from the actual URL
    // window.open(document.url, '_blank');
    
    // For demo purposes, just show a snackbar
    showSnackbar(`Downloading ${document.fileName}`, 'info');
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
      // In a real app, this would be an API call
      // await axios.post(`/api/patients/${id}/communications`, newMessage);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new communication record
      const now = new Date();
      const newComm = {
        id: `comm${communications.length + 1}`,
        type: newMessage.type,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: newMessage.message,
        status: 'Sent',
        response: null
      };
      
      // Update local state
      setCommunications([newComm, ...communications]);
      handleSendMessageDialogClose();
      showSnackbar(`Message sent via ${newMessage.type}`, 'success');
    } catch (err) {
      console.error('Error sending message:', err);
      showSnackbar('Failed to send message', 'error');
    }
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
              Patient ID: {patient.id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Registered: {format(new Date(patient.registrationDate), 'dd MMM yyyy')}
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
                    <Typography variant="body1">{patient.firstName} {patient.lastName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                    <Typography variant="body1">
                      {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')} ({patient.age} years)
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
                      {patient.address}, {patient.city}, {patient.state} - {patient.pincode}
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
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Allergies</Typography>
                    <Typography variant="body1">{patient.allergies || 'None'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Medical History</Typography>
                    <Typography variant="body1">{patient.medicalHistory || 'None'}</Typography>
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
                    <Typography variant="body1">{patient.clinic.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Registration Date</Typography>
                    <Typography variant="body1">
                      {format(new Date(patient.registrationDate), 'dd MMM yyyy')}
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
                              {format(new Date(appointment.date), 'dd MMM yyyy')} at {appointment.time}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                            <Typography variant="body1">{appointment.type}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Dentist</Typography>
                            <Typography variant="body1">{appointment.dentist}</Typography>
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
                            <Typography variant="subtitle2" color="textSecondary">Tooth</Typography>
                            <Typography variant="body1">{treatment.tooth}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Period</Typography>
                            <Typography variant="body1">
                              {format(new Date(treatment.startDate), 'dd MMM yyyy')} - 
                              {format(new Date(treatment.endDate), 'dd MMM yyyy')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <Chip
                              label={treatment.status}
                              color={
                                treatment.status === 'completed' ? 'success' :
                                treatment.status === 'in-progress' ? 'warning' :
                                treatment.status === 'planned' ? 'info' : 'default'
                              }
                              size="small"
                            />
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
                onClick={() => navigate(`/invoices/create?patientId=${id}`)}
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
                              {format(new Date(invoice.date), 'dd MMM yyyy')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                            <Typography variant="body1">
                              ₹{invoice.amount.toLocaleString('en-IN')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <Chip
                              label={invoice.status}
                              color={
                                invoice.status === 'paid' ? 'success' :
                                invoice.status === 'pending' ? 'warning' :
                                invoice.status === 'overdue' ? 'error' : 'default'
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
                                    primary={item.name}
                                    secondary={`₹${item.price.toLocaleString('en-IN')}`}
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
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadDialogOpen}
              >
                Upload Document
              </Button>
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
                      <TableRow key={document.id}>
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
                        <TableCell>{document.description}</TableCell>
                        <TableCell>{format(new Date(document.uploadDate), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{document.size}</TableCell>
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
                              onClick={() => handleDeleteDocument(document.id)} 
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
                          {format(new Date(comm.date), 'dd MMM yyyy')}, {comm.time}
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
                  Uploaded on {format(new Date(currentDocument.uploadDate), 'dd MMM yyyy')} by {currentDocument.uploadedBy}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {currentDocument.fileType.startsWith('image/') ? (
                  <img 
                    src={currentDocument.url} 
                    alt={currentDocument.fileName} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
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
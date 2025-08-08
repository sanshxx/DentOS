# 🗄️ Database Migration Guide: Test → DentOS

## 📊 **Current Situation**

You currently have your development data in the `test` database and want to migrate to the `DentOS` database for production deployment.

### **Current Setup**
- **Development Database**: `test` (contains all your demo data)
- **Production Database**: `DentOS` (empty, ready for production data)
- **Connection String**: Currently points to default database

## 🎯 **Migration Plan**

### **Step 1: Update Database Configuration**

First, update your `.env` file to use the DentOS database:

```bash
# Navigate to backend directory
cd backend

# Run the configuration update script
node update-database-config.js
```

**Manual Update (if script doesn't work):**
Update your `backend/.env` file:
```env
# Change this line:
MONGODB_URI=mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/?retryWrites=true&w=majority&appName=DentOS-db

# To this:
MONGODB_URI=mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/DentOS?retryWrites=true&w=majority&appName=DentOS-db
```

### **Step 2: Run Data Migration**

Execute the migration script to move all data from `test` to `DentOS`:

```bash
# Run the migration script
node migrate-to-production-db.js
```

**What the migration script does:**
1. ✅ Connects to `test` database
2. ✅ Extracts all data (organizations, users, patients, etc.)
3. ✅ Connects to `DentOS` database
4. ✅ Clears any existing data in `DentOS`
5. ✅ Inserts all data from `test` into `DentOS`
6. ✅ Verifies migration success

### **Step 3: Verify Migration**

After migration, verify that all data has been moved:

1. **Check MongoDB Atlas**:
   - Go to your MongoDB Atlas dashboard
   - Navigate to the `DentOS` database
   - Verify all collections are present with data

2. **Test Application**:
   - Start your backend server
   - Test login with demo credentials
   - Verify all features work with new database

## 📋 **Data Being Migrated**

The migration script will move all the following data:

### **Core Data**
- ✅ **Organizations**: 1 organization (Smile Care Dental Clinic)
- ✅ **Users**: 5 users (admin, manager, dentist, receptionist, assistant)
- ✅ **Clinics**: 2 clinics (Main Branch, Andheri Branch)
- ✅ **Patients**: 8 patients with complete medical histories
- ✅ **Staff**: Staff profiles and assignments

### **Operational Data**
- ✅ **Appointments**: Multiple appointments across dates
- ✅ **Treatments**: Treatment definitions and patient treatments
- ✅ **Inventory**: Stock items and management data
- ✅ **Invoices**: Billing and payment records
- ✅ **Documents**: Patient document uploads
- ✅ **Communications**: Patient communication history
- ✅ **Notifications**: System notifications
- ✅ **Join Requests**: Organization join requests

## 🔧 **Environment Variables for Production**

### **Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/DentOS?retryWrites=true&w=majority&appName=DentOS-db
JWT_SECRET=DentOS_dental_crm_secret_key_462580!
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=[your-email]
EMAIL_PASSWORD=[your-app-password]
EMAIL_FROM=[your-email]
TWILIO_ACCOUNT_SID=[your-twilio-sid]
TWILIO_AUTH_TOKEN=[your-twilio-token]
TWILIO_PHONE_NUMBER=[your-twilio-number]
MAX_FILE_UPLOAD=5000000
FILE_UPLOAD_PATH=./public/uploads
```

### **Render Environment Variables**
When deploying to Render, set these environment variables:
- `MONGODB_URI`: `mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/DentOS?retryWrites=true&w=majority&appName=DentOS-db`
- `NODE_ENV`: `production`
- All other variables as needed

## 🧪 **Testing After Migration**

### **1. Test Database Connection**
```bash
# Test the health endpoint
curl http://localhost:5000/api/health
```

### **2. Test Demo Login**
Use these credentials to verify data migration:
- **Admin**: admin@smilecare.com / Demo@2025
- **Manager**: manager@smilecare.com / Demo@2025
- **Dentist**: dentist@smilecare.com / Demo@2025
- **Receptionist**: receptionist@smilecare.com / Demo@2025
- **Assistant**: assistant@smilecare.com / Demo@2025

### **3. Test Key Features**
- ✅ User authentication and role-based access
- ✅ Patient management with documents
- ✅ Appointment scheduling
- ✅ Billing and invoices
- ✅ Inventory management
- ✅ Theme switching
- ✅ Notifications

## 🚨 **Important Notes**

### **Backup Strategy**
- The migration script creates a copy of your data
- Original `test` database remains unchanged
- You can always rollback by switching back to `test` database

### **Production Considerations**
- `DentOS` database is now your production database
- All new data will be stored in `DentOS`
- `test` database can be used for future development/testing

### **Security**
- Database credentials are properly configured
- Connection string includes proper authentication
- Production environment variables are secure

## 📝 **Post-Migration Checklist**

After running the migration:

- [ ] ✅ Database configuration updated
- [ ] ✅ Data migration completed successfully
- [ ] ✅ Application connects to DentOS database
- [ ] ✅ Demo login works with new database
- [ ] ✅ All features functional
- [ ] ✅ Ready for production deployment

## 🚀 **Next Steps**

1. **Complete Migration**: Run the migration scripts
2. **Test Thoroughly**: Verify all functionality
3. **Deploy to Production**: Use updated configuration
4. **Monitor**: Check application logs and performance

## 🔍 **Troubleshooting**

### **Migration Fails**
- Check MongoDB Atlas connection
- Verify database permissions
- Check network connectivity

### **Data Missing After Migration**
- Verify migration script output
- Check MongoDB Atlas for data
- Re-run migration if needed

### **Application Won't Start**
- Check environment variables
- Verify database connection string
- Check server logs for errors

## ✅ **Migration Status**

**Ready to Migrate**: ✅ **YES**

Your DentOS application is ready to migrate from `test` to `DentOS` database for production deployment!

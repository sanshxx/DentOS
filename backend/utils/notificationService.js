const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Inventory = require('../models/Inventory');

// Create notification for appointment reminder
const createAppointmentReminder = async (appointment, user) => {
  try {
    // Check if notification already exists
    const existingNotification = await Notification.findOne({
      user: user._id,
      'relatedEntity.type': 'appointment',
      'relatedEntity.id': appointment._id,
      type: 'appointment',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (existingNotification) {
      console.log('Appointment reminder already exists for:', appointment._id);
      return existingNotification;
    }

    const notification = await Notification.create({
      user: user._id,
      organization: user.organization,
      title: 'Appointment Reminder',
      message: `Appointment reminder: ${appointment.patient.name} at ${new Date(appointment.appointmentDate).toLocaleTimeString()}`,
      type: 'appointment',
      priority: 'medium',
      relatedEntity: {
        type: 'appointment',
        id: appointment._id
      },
      actionUrl: `/appointments/${appointment._id}`,
      expiresAt: new Date(appointment.appointmentDate)
    });
    return notification;
  } catch (error) {
    console.error('Error creating appointment reminder:', error);
    throw error; // Re-throw to handle in calling function
  }
};

// Create notification for new patient registration
const createNewPatientNotification = async (patient, user) => {
  try {
    const notification = await Notification.create({
      user: user._id,
      organization: user.organization,
      title: 'New Patient Registration',
      message: `New patient registration: ${patient.name}`,
      type: 'patient',
      priority: 'low',
      relatedEntity: {
        type: 'patient',
        id: patient._id
      },
      actionUrl: `/patients/${patient._id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    return notification;
  } catch (error) {
    console.error('Error creating new patient notification:', error);
  }
};

// Create notification for low inventory
const createLowInventoryNotification = async (inventoryItem, user) => {
  try {
    const notification = await Notification.create({
      user: user._id,
      organization: user.organization,
      title: 'Inventory Alert',
      message: `Inventory alert: ${inventoryItem.itemName} running low (${inventoryItem.currentStock} remaining)`,
      type: 'inventory',
      priority: 'high',
      relatedEntity: {
        type: 'inventory',
        id: inventoryItem._id
      },
      actionUrl: `/inventory/${inventoryItem._id}`,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    });
    return notification;
  } catch (error) {
    console.error('Error creating low inventory notification:', error);
  }
};

// Create notification for overdue invoice
const createOverdueInvoiceNotification = async (invoice, user) => {
  try {
    const notification = await Notification.create({
      user: user._id,
      organization: user.organization,
      title: 'Overdue Invoice',
      message: `Overdue invoice: ${invoice.patient.name} - ${invoice.invoiceNumber}`,
      type: 'billing',
      priority: 'high',
      relatedEntity: {
        type: 'invoice',
        id: invoice._id
      },
      actionUrl: `/billing/invoice/${invoice._id}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    return notification;
  } catch (error) {
    console.error('Error creating overdue invoice notification:', error);
  }
};

// Create notification for treatment completion
const createTreatmentCompletionNotification = async (treatment, user) => {
  try {
    const notification = await Notification.create({
      user: user._id,
      organization: user.organization,
      title: 'Treatment Completed',
      message: `Treatment completed: ${treatment.treatmentName} for ${treatment.patient.name}`,
      type: 'treatment',
      priority: 'medium',
      relatedEntity: {
        type: 'treatment',
        id: treatment._id
      },
      actionUrl: `/treatments/${treatment._id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    return notification;
  } catch (error) {
    console.error('Error creating treatment completion notification:', error);
  }
};

// Create system notification
const createSystemNotification = async (title, message, user, priority = 'medium') => {
  try {
    const notification = await Notification.create({
      user: user._id,
      organization: user.organization,
      title,
      message,
      type: 'system',
      priority,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    return notification;
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
};

// Check and create low inventory notifications
const checkLowInventory = async (organization) => {
  try {
    const lowStockItems = await Inventory.find({
      organization: organization._id,
      'clinics.currentStock': { $lte: 5 }
    }).populate('createdBy');

    for (const item of lowStockItems) {
      // Check if notification already exists for this item
      const existingNotification = await Notification.findOne({
        user: item.createdBy._id,
        organization: organization._id,
        'relatedEntity.type': 'inventory',
        'relatedEntity.id': item._id,
        isRead: false
      });

      if (!existingNotification) {
        await createLowInventoryNotification(item, item.createdBy);
      }
    }
  } catch (error) {
    console.error('Error checking low inventory:', error);
  }
};

// Create appointment reminders for tomorrow
const createAppointmentReminders = async (organization) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      organization: organization._id,
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: 'scheduled'
    }).populate('patient dentist');

    for (const appointment of appointments) {
      // Check if reminder already exists
      const existingReminder = await Notification.findOne({
        user: appointment.dentist._id,
        organization: organization._id,
        'relatedEntity.type': 'appointment',
        'relatedEntity.id': appointment._id,
        type: 'appointment'
      });

      if (!existingReminder) {
        await createAppointmentReminder(appointment, appointment.dentist);
      }
    }
  } catch (error) {
    console.error('Error creating appointment reminders:', error);
  }
};

module.exports = {
  createAppointmentReminder,
  createNewPatientNotification,
  createLowInventoryNotification,
  createOverdueInvoiceNotification,
  createTreatmentCompletionNotification,
  createSystemNotification,
  checkLowInventory,
  createAppointmentReminders
};
